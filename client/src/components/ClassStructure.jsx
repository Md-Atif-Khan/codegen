import React, { useState } from 'react';
import api from '../services/api';
import { FaFolder, FaFolderOpen, FaFile, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const ClassStructure = ({ structure, onAddClass, onUpdateClass, onDeleteClass }) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [newClassName, setNewClassName] = useState('');
  const [newClassParents, setNewClassParents] = useState([]);
  const [classInputs, setClassInputs] = useState({});
  const [showDefinition, setShowDefinition] = useState({});

  const dataTypes = ['int', 'bool', 'string', 'char', 'long long', 'double', 'float', 'void'];

  const toggleClass = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const handleAddClass = () => {
    if (newClassName) {
      const nonExistentParents = newClassParents.filter((parent) => !structure.some((cls) => cls.name === parent.name));

      if (nonExistentParents.length > 0) {
        alert(`The following parent classes do not exist: ${nonExistentParents.map((p) => p.name).join(', ')}`);
        return;
      }

      const newClass = {
        name: newClassName,
        parents: newClassParents,
        public: { attributes: [], methods: [] },
        private: { attributes: [], methods: [] },
        protected: { attributes: [], methods: [] },
      };
      onAddClass(newClass);
      setNewClassName('');
      setNewClassParents([]);
    }
  };

  const handleAddAttribute = (className) => {
    const classInput = classInputs[className] || {};
    const updatedClass = structure.find((cls) => cls.name === className);
    if (updatedClass[classInput.attributeAccess || 'public'].attributes.some((attr) => attr.name === classInput.attributeName)) {
      alert('An attribute with this name already exists in this class.');
      return;
    }
    updatedClass[classInput.attributeAccess || 'public'].attributes.push({
      name: classInput.attributeName,
      type: classInput.attributeType || 'int',
      defaultValue: classInput.attributeDefaultValue,
    });
    onUpdateClass(updatedClass);
    setClassInputs(prev => ({
      ...prev,
      [className]: {
        ...prev[className],
        attributeName: '',
        attributeType: 'int',
        attributeAccess: 'public',
        attributeDefaultValue: '',
      }
    }));
  };

  const getInheritedMembers = (classItem) => {
    if (!classItem.parents || classItem.parents.length === 0) return { public: [], protected: [], private: [] };
  
    let inheritedMembers = { public: [], protected: [], private: [] };
  
    classItem.parents.forEach(parent => {
      const parentClass = structure.find(cls => cls.name === parent.name);
      if (parentClass) {
        const parentInherited = getInheritedMembers(parentClass);
  
        if (parent.inheritanceType === 'public') {
          inheritedMembers.public = [...inheritedMembers.public, ...parentClass.public.attributes, ...parentClass.public.methods, ...parentInherited.public];
          inheritedMembers.protected = [...inheritedMembers.protected, ...parentClass.protected.attributes, ...parentClass.protected.methods, ...parentInherited.protected];
        } else if (parent.inheritanceType === 'protected') {
          inheritedMembers.protected = [
            ...inheritedMembers.protected,
            ...parentClass.public.attributes, ...parentClass.public.methods,
            ...parentClass.protected.attributes, ...parentClass.protected.methods,
            ...parentInherited.public, ...parentInherited.protected
          ];
        } else if (parent.inheritanceType === 'private') {
          inheritedMembers.private = [
            ...inheritedMembers.private,
            ...parentClass.public.attributes, ...parentClass.public.methods,
            ...parentClass.protected.attributes, ...parentClass.protected.methods,
            ...parentInherited.public, ...parentInherited.protected
          ];
        }
      }
    });
  
    return inheritedMembers;
  };
  
  const handleAddMethod = (className) => {
    const classInput = classInputs[className] || {};
    const updatedClass = structure.find((cls) => cls.name === className);
    const params = classInput.methodParams ? classInput.methodParams.split(',').map((param) => param.trim()) : [];
    if (updatedClass[classInput.methodAccess || 'public'].methods.some((method) => method.name === classInput.methodName && method.params.join(',') === params.join(','))) {
      alert('A method with this signature already exists in this class.');
      return;
    }
    updatedClass[classInput.methodAccess || 'public'].methods.push({
      name: classInput.methodName,
      returnType: classInput.methodReturnType || 'void',
      params: params,
      definition: classInput.methodDefinition,
    });
    onUpdateClass(updatedClass);
    setClassInputs(prev => ({
      ...prev,
      [className]: {
        ...prev[className],
        methodName: '',
        methodReturnType: 'void',
        methodAccess: 'public',
        methodParams: '',
        methodDefinition: '',
      }
    }));
    setShowDefinition(prev => ({ ...prev, [className]: false }));
  };

  const handleAddParent = () => {
    setNewClassParents([...newClassParents, { name: '', inheritanceType: 'public' }]);
  };

  const handleDeleteMember = (className, access, type, name, params = []) => {
    const updatedClass = structure.find((cls) => cls.name === className);
    if (type === 'attribute') {
      updatedClass[access].attributes = updatedClass[access].attributes.filter((attr) => attr.name !== name);
    } else if (type === 'method') {
      updatedClass[access].methods = updatedClass[access].methods.filter((method) => !(method.name === name && method.params.join(',') === params.join(',')));
    }
    onUpdateClass(updatedClass);
  };

  const handleGetAISuggestions = async (className) => {
    const classInput = classInputs[className] || {};
    try {
      const response = await api.post('/ai/suggest', {
        methodName: classInput.methodName,
        returnType: classInput.methodReturnType,
        params: classInput.methodParams,
        description: classInput.methodDefinition,
      });
      setClassInputs(prev => ({
        ...prev,
        [className]: {
          ...prev[className],
          methodDefinition: response.data.suggestion,
        }
      }));
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    }
  };

  const renderMembers = (classItem, access) => {
    const inheritedMembers = getInheritedMembers(classItem);
    const inheritedMemberNames = new Set([...inheritedMembers.public, ...inheritedMembers.protected, ...inheritedMembers.private].map(m => m.name));
  
    return (
      <div>
        <h4>{access}</h4>
        {access === 'public' && classItem.parents && classItem.parents.some(p => p.inheritanceType === 'public') &&
          inheritedMembers.public.map(member => (
            <div key={`inherited-${member.name}`} className="member-item text-gray-400 italic">
              <FaFile className="inline-block mr-2" /> {member.type || member.returnType} {member.name} (inherited)
            </div>
          ))
        }
        {access === 'protected' && classItem.parents &&
          (classItem.parents.some(p => p.inheritanceType === 'public') || classItem.parents.some(p => p.inheritanceType === 'protected')) &&
          inheritedMembers.protected.map(member => (
            <div key={`inherited-${member.name}`} className="member-item text-gray-400 italic">
              <FaFile className="inline-block mr-2" /> {member.type || member.returnType} {member.name} (inherited)
            </div>
          ))
        }
        {access === 'private' && classItem.parents && classItem.parents.some(p => p.inheritanceType === 'private') &&
          inheritedMembers.private.map(member => (
            <div key={`inherited-${member.name}`} className="member-item text-gray-400 italic">
              <FaFile className="inline-block mr-2" /> {member.type || member.returnType} {member.name} (inherited)
            </div>
          ))
        }
        {classItem[access]?.attributes?.filter(attr => !inheritedMemberNames.has(attr.name)).map(attr => (
          <div key={attr.name} className="attribute-item text-gray-400">
            <FaFile className="inline-block mr-2" /> {attr.type} {attr.name}
            <button onClick={() => handleDeleteMember(classItem.name, access, 'attribute', attr.name)} className="ml-2 text-red-500"><FaMinus /></button>
          </div>
        ))}
        {classItem[access]?.methods?.filter(method => !inheritedMemberNames.has(method.name)).map(method => (
          <div key={`${method.name}(${method.params.join(',')})`} className="method-item text-gray-400">
            <FaFile className="inline-block mr-2" /> {method.returnType} {method.name}({method.params.join(', ')})
            <button onClick={() => handleDeleteMember(classItem.name, access, 'method', method.name, method.params)} className="ml-2 text-red-500"><FaMinus /></button>
          </div>
        ))}
        {classItem[access]?.methods?.filter(method => inheritedMemberNames.has(method.name)).map(method => (
          <div key={`${method.name}(${method.params.join(',')})`} className="method-item text-gray-400">
            <FaFile className="inline-block mr-2" /> {method.returnType} {method.name}({method.params.join(', ')})(overriden)
            <button onClick={() => handleDeleteMember(classItem.name, access, 'method', method.name, method.params)} className="ml-2 text-red-500"><FaMinus /></button>
          </div>
        ))}
      </div>
    );
  };
  

  const renderClass = (classItem) => {
    const isExpanded = expandedClasses[classItem.name];
    const classInput = classInputs[classItem.name] || {};
    return (
      <div key={classItem.name} className="class-item group transition-transform transform hover:scale-105 hover:bg-gray-700 p-2 rounded-md">
        <div className="flex justify-between items-center">
          <div onClick={() => toggleClass(classItem.name)} className="class-header cursor-pointer flex items-center space-x-2 text-lg text-gray-300 group-hover:text-white">
            {isExpanded ? <FaFolderOpen /> : <FaFolder />} <span>{classItem.name}</span>
            {classItem.parents && classItem.parents.length > 0 && (
              <span className="text-sm text-gray-400">
                : {classItem.parents.map((parent) => `${parent.inheritanceType} ${parent.name}`).join(', ')}
              </span>
            )}
          </div>
          <button onClick={() => onDeleteClass(classItem.name)} className="text-red-500 hover:text-red-700">
            <FaTrash /> Delete
          </button>
        </div>
        {isExpanded && (
          <div className="class-content ml-5 mt-2">
            {['private', 'protected', 'public'].map(access => renderMembers(classItem, access))}
            <div className="add-attribute flex items-center mt-2">
              <input
                type="text"
                value={classInput.attributeName || ''}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    attributeName: e.target.value
                  }
                }))}
                placeholder="Attribute Name"
                className="text-black p-1 rounded mr-2"
              />
              <select
                value={classInput.attributeType || 'int'}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    attributeType: e.target.value
                  }
                }))}
                className="text-black p-1 rounded mr-2"
              >
                {dataTypes.filter(type => type !== 'void').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={classInput.attributeAccess || 'public'}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    attributeAccess: e.target.value
                  }
                }))}
                className="text-black p-1 rounded mr-2"
              >
                <option value="private">Private</option>
                <option value="protected">Protected</option>
                <option value="public">Public</option>
              </select>
              <input
                type="text"
                value={classInput.attributeDefaultValue || ''}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    attributeDefaultValue: e.target.value
                  }
                }))}
                placeholder="Default Value"
                className="text-black p-1 rounded mr-2"
              />
              <button onClick={() => handleAddAttribute(classItem.name)} className="bg-blue-500 text-white p-1 rounded">
                <FaPlus /> Add Attribute
              </button>
            </div>
            <div className="add-method flex items-center mt-2">
              <input
                type="text"
                value={classInput.methodName || ''}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    methodName: e.target.value
                  }
                }))}
                placeholder="Method Name"
                className="text-black p-1 rounded mr-2"
              />
              <select
                value={classInput.methodReturnType || 'void'}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    methodReturnType: e.target.value
                  }
                }))}
                className="text-black p-1 rounded mr-2"
              >
                {dataTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={classInput.methodAccess || 'public'}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    methodAccess: e.target.value
                  }
                }))}
                className="text-black p-1 rounded mr-2"
              >
                <option value="private">Private</option>
                <option value="protected">Protected</option>
                <option value="public">Public</option>
              </select>
              <input
                type="text"
                value={classInput.methodParams || ''}
                onChange={(e) => setClassInputs(prev => ({
                  ...prev,
                  [classItem.name]: {
                    ...prev[classItem.name],
                    methodParams: e.target.value
                  }
                }))}
                placeholder="Parameters (comma-separated)"
                className="text-black p-1 rounded mr-2"
              />
              <button onClick={() => setShowDefinition(prev => ({ ...prev, [classItem.name]: !prev[classItem.name] }))} className="bg-purple-500 text-white p-1 rounded mr-2">
                {showDefinition[classItem.name] ? 'Hide Definition' : 'Add Definition'}
              </button>
              <button onClick={() => handleAddMethod(classItem.name)} className="bg-green-500 text-white p-1 rounded">
                <FaPlus /> Add Method
              </button>
            </div>
            {showDefinition[classItem.name] && (
              <div className="mt-2">
                <textarea
                  value={classInput.methodDefinition || ''}
                  onChange={(e) => setClassInputs(prev => ({
                    ...prev,
                    [classItem.name]: {
                      ...prev[classItem.name],
                      methodDefinition: e.target.value
                    }
                  }))}
                  placeholder="Write your function definition or get AI suggestions on your description"
                  className="w-full h-32 p-2 text-black rounded"
                />
                <button 
                  onClick={() => handleGetAISuggestions(classItem.name)} 
                  className="mt-2 bg-indigo-500 text-white p-1 rounded"
                >
                  Get AI Suggestions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="class-structure">
      <div className="class-list">
        {structure.map((classItem) => renderClass(classItem))}
      </div>
      <div className="add-class mt-4">
        <h3 className="text-white text-lg">Add New Class</h3>
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Class Name"
            className="text-black p-1 rounded mr-2"
          />
          <button onClick={handleAddParent} className="bg-green-500 text-white p-1 rounded mr-2">
            Add Parent
          </button>
          <button onClick={handleAddClass} className="bg-blue-500 text-white p-1 rounded">
            <FaPlus /> Add Class
          </button>
        </div>
        {newClassParents.map((parent, index) => (
          <div key={index} className="parent-class mt-2 flex items-center">
            <input
              type="text"
              value={parent.name}
              onChange={(e) =>
                setNewClassParents((prev) =>
                  prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p))
                )
              }
              placeholder="Parent Class Name"
              className="text-black p-1 rounded mr-2"
            />
            <select
              value={parent.inheritanceType}
              onChange={(e) =>
                setNewClassParents((prev) =>
                  prev.map((p, i) => (i === index ? { ...p, inheritanceType: e.target.value } : p))
                )
              }
              className="text-black p-1 rounded mr-2"
            >
              <option value="public">Public</option>
              <option value="protected">Protected</option>
              <option value="private">Private</option>
            </select>
            <button
              onClick={() => setNewClassParents((prev) => prev.filter((_, i) => i !== index))}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash /> Delete Parent
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassStructure;
