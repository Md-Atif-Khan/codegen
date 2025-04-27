import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../../components/CodeEditor';
import ClassStructure from '../../components/ClassStructure';
// import CodeStructureViewer from '../../components/CodeStructureViewer';
import api from '../../services/api';
import { showSuccessToast } from '../../utils/toaster';
import { FaCopy } from 'react-icons/fa';
import './style.css';

const ProjectPage = () => {
  const editorRef = useRef(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const { id } = useParams();
  const projectId = location.state?.projectId || id;
  const [classStructure, setClassStructure] = useState(() => {
    const savedStructure = localStorage.getItem('classStructure');
    return savedStructure ? JSON.parse(savedStructure) : [];
  });

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'cpp';
  });

  const [pName, setpName] = useState('');
  const [pDesc, setpDesc] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        const { name: fetchedName, description: fetchedDesc, classStructure: fetchedStructure, code: fetchedCode } = response.data;
        setpName(fetchedName);
        setpDesc(fetchedDesc);
        setClassStructure(fetchedStructure || []);
        localStorage.setItem('classStructure', JSON.stringify(fetchedStructure || []));

        setLanguage(fetchedCode ? 'cpp' : 'cpp');
        localStorage.setItem('language', fetchedCode ? 'cpp' : 'cpp');
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [projectId]);

  const applyInheritanceRules = (childClass, parentClass, inheritanceType) => {
    const inheritedMembers = {
      public: { attributes: [], methods: [] },
      protected: { attributes: [], methods: [] },
      private: { attributes: [], methods: [] }
    };

    ['public', 'protected'].forEach(access => {
      parentClass[access].attributes.forEach(attr => {
        const newAccess = inheritanceType === 'public' ? access : inheritanceType;
        inheritedMembers[newAccess].attributes.push({ ...attr, inherited: true });
      });
      parentClass[access].methods.forEach(method => {
        const newAccess = inheritanceType === 'public' ? access : inheritanceType;
        inheritedMembers[newAccess].methods.push({ ...method, inherited: true });
      });
    });

    return {
      ...childClass,
      public: {
        attributes: [...childClass.public.attributes, ...inheritedMembers.public.attributes],
        methods: [...childClass.public.methods, ...inheritedMembers.public.methods]
      },
      protected: {
        attributes: [...childClass.protected.attributes, ...inheritedMembers.protected.attributes],
        methods: [...childClass.protected.methods, ...inheritedMembers.protected.methods]
      },
      private: {
        attributes: [...childClass.private.attributes, ...inheritedMembers.private.attributes],
        methods: [...childClass.private.methods, ...inheritedMembers.private.methods]
      }
    };
  };

  const handleAddClass = (newClass) => {
    if (classStructure.some(cls => cls.name === newClass.name)) {
      alert('A class with this name already exists.');
      return;
    }
    let updatedClass = newClass;
    if (newClass.parents && newClass.parents.length > 0) {
      newClass.parents.forEach(parent => {
        const parentClass = classStructure.find(cls => cls.name === parent.name);
        if (parentClass) {
          updatedClass = applyInheritanceRules(updatedClass, parentClass, parent.inheritanceType);
        }
      });
    }
    setClassStructure([...classStructure, updatedClass]);
  };

  const handleUpdateClass = (updatedClass) => {
    setClassStructure(classStructure.map(cls =>
      cls.name === updatedClass.name ? updatedClass : cls
    ));
  };

  const handleDeleteOverride = (className, methodName, access) => {
    setClassStructure(prevStructure =>
      prevStructure.map(cls => {
        if (cls.name === className) {
          const updatedMethods = cls[access].methods.map(method =>
            method.name === methodName ? { ...method, inherited: true, definition: '' } : method
          );
          return { ...cls, [access]: { ...cls[access], methods: updatedMethods } };
        }
        return cls;
      })
    );
  };

  const deleteClass = (className) => {
    const classesToDelete = [className];
    const findDescendants = (parentName) => {
      classStructure.forEach(cls => {
        if (cls.parents && cls.parents.some(parent => parent.name === parentName)) {
          classesToDelete.push(cls.name);
          findDescendants(cls.name);
        }
      });
    };
    findDescendants(className);

    setClassStructure(prevStructure =>
      prevStructure.filter(cls => !classesToDelete.includes(cls.name))
    );
  };

  const generateCode = () => {
    return classStructure.map(classItem => {
      const classCode = [];
      const inheritanceString = classItem.parents && classItem.parents.length > 0
        ? ` : ${classItem.parents.map(parent => `${parent.inheritanceType} ${parent.name}`).join(', ')}`
        : '';
      classCode.push(`class ${classItem.name}${inheritanceString} {`);

      ['public', 'protected', 'private'].forEach(access => {
        if (classItem[access].attributes.length > 0 || classItem[access].methods.length > 0) {
          classCode.push(`${access}:`);
          classItem[access].attributes.forEach(attr => {
            if (!attr.inherited) {
              classCode.push(`  ${attr.type} ${attr.name}${attr.defaultValue ? ` = ${attr.defaultValue}` : ''};`);
            }
          });
          classItem[access].methods.forEach(method => {
            if (!method.inherited || method.definition) {
              const signature = `${method.returnType} ${method.name}(${method.params.join(', ')})`;
              classCode.push(`  ${signature} {`);
              if (method.definition) {
                classCode.push(method.definition.split('\n').map(line => `    ${line}`).join('\n'));
              } else {
                classCode.push('    // TODO: Implement method');
              }
              classCode.push('  }');
            }
          });
        }
      });

      classCode.push('};');
      return classCode.join('\n');
    }).join('\n\n');
  };

  const handleMouseDown = (e) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setLeftPanelWidth(e.clientX);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/projects/${projectId}`, {
        classStructure,
        code: generateCode(),
      });
      localStorage.clear();
      showSuccessToast('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code);
      showSuccessToast('Copied!');
    }
  };

  const supportedLanguages = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' }
  ];

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className="project-layout">
      <div className="left-panel" style={{ width: `${leftPanelWidth}px` }}>
        <div className="project-info">
          <h2 className="project-name">Project Name: {pName}</h2>
          <p className="project-description">Project Description: {pDesc}</p>
        </div>
        <hr className="divider" />
        <ClassStructure
          structure={classStructure}
          onAddClass={handleAddClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={deleteClass}
          onDeleteOverride={handleDeleteOverride}
        />
        {/* <CodeStructureViewer classStructure={classStructure} /> */}
      </div>
      <div className="resizer" onMouseDown={handleMouseDown} />
      <div className="right-panel">
        <div className="editor-controls">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          <button onClick={handleCopy} className="copy-button">
            <FaCopy /> Copy
          </button>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
        </div>
        <CodeEditor
          code={generateCode()}
          language={language}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
};

export default ProjectPage;
