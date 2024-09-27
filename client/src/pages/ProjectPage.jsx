import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import ClassStructure from '../components/ClassStructure';
import api from '../services/api';

const ProjectPage = () => {
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
        inheritedMembers[newAccess].attributes.push({...attr, inherited: true});
      });
      parentClass[access].methods.forEach(method => {
        const newAccess = inheritanceType === 'public' ? access : inheritanceType;
        inheritedMembers[newAccess].methods.push({...method, inherited: true});
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
            method.name === methodName ? {...method, inherited: true, definition: ''} : method
          );
          return {...cls, [access]: {...cls[access], methods: updatedMethods}};
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
      console.log("projectid ", projectId);
      await api.put(`/projects/${projectId}`, {
        classStructure,
        code: generateCode(),
      });
      localStorage.clear();
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <div style={{ width: `${leftPanelWidth}px` }} className="flex-shrink-0 border-r border-gray-200 p-5 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <br />
        <br />
        <div className="mt-auto pt-4 border-t border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-blue-300">Project Name: {pName}</h2>
          <p className="text-sm text-gray-300">Project Description: {pDesc}</p>
        </div>
        <br />
        <hr />
        <br />
        <ClassStructure
          structure={classStructure}
          onAddClass={handleAddClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={deleteClass}
          onDeleteOverride={handleDeleteOverride}
        />
      </div>
      <div
        className="w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400"
        onMouseDown={handleMouseDown}
      />
      <div className="flex-grow mt-10 pt-10 flex flex-col overflow-hidden relative">
        <button 
          onClick={handleSave}
          className="absolute top-7 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Save
        </button>
        <CodeEditor code={generateCode()} language={language} />
      </div>
    </div>
  );
};

export default ProjectPage;
