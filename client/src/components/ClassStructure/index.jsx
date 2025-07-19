import React, { useState } from 'react';
import { Treebeard } from 'react-treebeard';
import api from '../../services/api';
import { FaFolder, FaFolderOpen, FaFile, FaPlus, FaMinus, FaTrash, FaCog, FaEye, FaEyeSlash } from 'react-icons/fa';
import './style.css';

const ClassStructure = ({ structure, onAddClass, onUpdateClass, onDeleteClass }) => {
    const [expandedClasses, setExpandedClasses] = useState({});
    const [newClassName, setNewClassName] = useState('');
    const [newClassParents, setNewClassParents] = useState([]);
    const [classInputs, setClassInputs] = useState({});
    const [showDefinition, setShowDefinition] = useState({});
    const [cursor, setCursor] = useState(false);
    const [useTreeView, setUseTreeView] = useState(false);

    const dataTypes = ['int', 'bool', 'string', 'char', 'long long', 'double', 'float', 'void'];

    // Treebeard theme configuration
    const treeTheme = {
        scheme: 'default',
        author: 'chris kempson (http://chriskempson.com)',
        base00: '#181818',
        base01: '#282828',
        base02: '#383838',
        base03: '#585858',
        base04: '#b8b8b8',
        base05: '#d8d8d8',
        base06: '#e8e8e8',
        base07: '#f8f8f8',
        base08: '#ab4642',
        base09: '#dc9656',
        base0A: '#f7ca88',
        base0B: '#a1b56c',
        base0C: '#86c1b9',
        base0D: '#7cafc2',
        base0E: '#ba8baf',
        base0F: '#a16946',
        tree: {
            base: {
                listStyle: 'none',
                backgroundColor: '#1f2937',
                margin: 0,
                padding: 0,
                fontSize: '14px',
                fontFamily: 'monospace'
            },
            node: {
                base: {
                    position: 'relative'
                },
                link: {
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0px 5px',
                    display: 'block'
                },
                activeLink: {
                    background: '#374151'
                },
                toggle: {
                    base: {
                        position: 'relative',
                        display: 'inline-block',
                        verticalAlign: 'top',
                        marginLeft: '-5px',
                        height: '24px',
                        width: '24px'
                    },
                    wrapper: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        margin: '-7px 0 0 -7px',
                        height: '14px'
                    },
                    height: 14,
                    width: 14,
                    arrow: {
                        fill: '#9CA3AF',
                        strokeWidth: 0
                    }
                },
                header: {
                    base: {
                        display: 'inline-block',
                        verticalAlign: 'top',
                        color: '#D1D5DB',
                        marginLeft: '10px'
                    },
                    connector: {
                        width: '2px',
                        height: '12px',
                        borderLeft: 'solid 2px black',
                        borderBottom: 'solid 2px black',
                        position: 'absolute',
                        top: '0px',
                        left: '-21px'
                    },
                    title: {
                        lineHeight: '24px',
                        verticalAlign: 'middle'
                    }
                }
            }
        }
    };

    const toggleClass = (className) => {
        setExpandedClasses((prev) => ({
            ...prev,
            [className]: !prev[className],
        }));
    };

    // Convert class structure to tree format for Treebeard
    const convertToTreeData = () => {
        return {
            name: 'Classes',
            toggled: true,
            children: structure.map(classItem => ({
                name: classItem.name,
                classData: classItem,
                toggled: expandedClasses[classItem.name] || false,
                children: [
                    {
                        name: 'private',
                        access: 'private',
                        classData: classItem,
                        toggled: true,
                        children: [
                            ...classItem.private?.attributes?.map(attr => ({
                                name: `${attr.type} ${attr.name}`,
                                type: 'attribute',
                                data: attr,
                                access: 'private',
                                classData: classItem
                            })) || [],
                            ...classItem.private?.methods?.map(method => ({
                                name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                                type: 'method',
                                data: method,
                                access: 'private',
                                classData: classItem
                            })) || []
                        ]
                    },
                    {
                        name: 'protected',
                        access: 'protected',
                        classData: classItem,
                        toggled: true,
                        children: [
                            ...classItem.protected?.attributes?.map(attr => ({
                                name: `${attr.type} ${attr.name}`,
                                type: 'attribute',
                                data: attr,
                                access: 'protected',
                                classData: classItem
                            })) || [],
                            ...classItem.protected?.methods?.map(method => ({
                                name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                                type: 'method',
                                data: method,
                                access: 'protected',
                                classData: classItem
                            })) || []
                        ]
                    },
                    {
                        name: 'public',
                        access: 'public',
                        classData: classItem,
                        toggled: true,
                        children: [
                            ...classItem.public?.attributes?.map(attr => ({
                                name: `${attr.type} ${attr.name}`,
                                type: 'attribute',
                                data: attr,
                                access: 'public',
                                classData: classItem
                            })) || [],
                            ...classItem.public?.methods?.map(method => ({
                                name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                                type: 'method',
                                data: method,
                                access: 'public',
                                classData: classItem
                            })) || []
                        ]
                    }
                ]
            }))
        };
    };

    const onToggle = (node, toggled) => {
        if (cursor) {
            cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        if (node.classData && !node.access) {
            // This is a class node
            toggleClass(node.classData.name);
        }
        setCursor(node);
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
                        <div key={`inherited-${member.name}`} className="member-item inherited-member">
                            <FaFile /> {member.type || member.returnType} {member.name} (inherited)
                        </div>
                    ))
                }
                {access === 'protected' && classItem.parents &&
                    (classItem.parents.some(p => p.inheritanceType === 'public') || classItem.parents.some(p => p.inheritanceType === 'protected')) &&
                    inheritedMembers.protected.map(member => (
                        <div key={`inherited-${member.name}`} className="member-item inherited-member">
                            <FaFile /> {member.type || member.returnType} {member.name} (inherited)
                        </div>
                    ))
                }
                {access === 'private' && classItem.parents && classItem.parents.some(p => p.inheritanceType === 'private') &&
                    inheritedMembers.private.map(member => (
                        <div key={`inherited-${member.name}`} className="member-item inherited-member">
                            <FaFile /> {member.type || member.returnType} {member.name} (inherited)
                        </div>
                    ))
                }
                {classItem[access]?.attributes?.filter(attr => !inheritedMemberNames.has(attr.name)).map(attr => (
                    <div key={attr.name} className="attribute-item">
                        <FaFile /> {attr.type} {attr.name}
                        <button onClick={() => handleDeleteMember(classItem.name, access, 'attribute', attr.name)}
                            className="delete-button">
                            <FaMinus />
                        </button>
                    </div>
                ))}
                {classItem[access]?.methods?.filter(method => !inheritedMemberNames.has(method.name)).map(method => (
                    <div key={`${method.name}(${method.params.join(',')})`} className="method-item">
                        <FaFile /> {method.returnType} {method.name}({method.params.join(', ')})
                        <button onClick={() => handleDeleteMember(classItem.name, access, 'method', method.name, method.params)}
                            className="delete-button">
                            <FaMinus />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderClass = (classItem) => {
        const isExpanded = expandedClasses[classItem.name];
        const classInput = classInputs[classItem.name] || {};

        return (
            <div key={classItem.name} className="class-item">
                <div className="class-header">
                    <div onClick={() => toggleClass(classItem.name)}>
                        {isExpanded ? <FaFolderOpen /> : <FaFolder />}
                        <span>{classItem.name}</span>
                        {classItem.parents && classItem.parents.length > 0 && (
                            <span className="parent-info">
                                : {classItem.parents.map((parent) => `${parent.inheritanceType} ${parent.name}`).join(', ')}
                            </span>
                        )}
                    </div>
                    <button onClick={() => onDeleteClass(classItem.name)} className="delete-button">
                        <FaTrash /> Delete
                    </button>
                </div>

                {isExpanded && (
                    <div className="class-content">
                        <div className="members-section">
                            {['private', 'protected', 'public'].map(access => renderMembers(classItem, access))}
                        </div>

                        <div className="forms-section">
                            <h4 className="forms-title">Add New Members</h4>
                            <div className="form-group">
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
                                    className="form-input"
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
                                    className="form-select"
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
                                    className="form-select"
                                >
                                    <option value="public">Public</option>
                                    <option value="protected">Protected</option>
                                    <option value="private">Private</option>
                                </select>
                                <button onClick={() => handleAddAttribute(classItem.name)}
                                    className="button button-blue">
                                    <FaPlus /> Add Attribute
                                </button>
                            </div>

                            <div className="form-group">
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
                                    className="form-input"
                                />
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
                                    placeholder="Parameters (e.g., int x, string y)"
                                    className="form-input"
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
                                    className="form-select"
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
                                    className="form-select"
                                >
                                    <option value="public">Public</option>
                                    <option value="protected">Protected</option>
                                    <option value="private">Private</option>
                                </select>
                                <button onClick={() => setShowDefinition(prev => ({ ...prev, [classItem.name]: !prev[classItem.name] }))}
                                    className="button button-purple">
                                    <FaCog /> {showDefinition[classItem.name] ? 'Hide' : 'Show'} Definition
                                </button>
                                <button onClick={() => handleAddMethod(classItem.name)}
                                    className="button button-green">
                                    <FaPlus /> Add Method
                                </button>
                            </div>

                            {showDefinition[classItem.name] && (
                                <div className="method-definition">
                                    <textarea
                                        value={classInput.methodDefinition || ''}
                                        onChange={(e) => setClassInputs(prev => ({
                                            ...prev,
                                            [classItem.name]: {
                                                ...prev[classItem.name],
                                                methodDefinition: e.target.value
                                            }
                                        }))}
                                        placeholder="Write your function definition or get AI suggestions"
                                        className="method-textarea"
                                    />
                                    <button
                                        onClick={() => handleGetAISuggestions(classItem.name)}
                                        className="button button-purple"
                                    >
                                        Get AI Suggestions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="class-structure">
            <div className="structure-header">
                <h2 className="structure-title">Class Structure</h2>
                <div className="view-controls">
                    <button
                        onClick={() => setUseTreeView(!useTreeView)}
                        className={`button ${useTreeView ? 'button-blue' : 'button-gray'}`}
                        title="Toggle between tree and detailed view"
                    >
                        {useTreeView ? <FaEye /> : <FaEyeSlash />}
                        {useTreeView ? 'Tree View' : 'Detailed View'}
                    </button>
                </div>
            </div>

            {useTreeView ? (
                <div className="tree-view-container">
                    <Treebeard
                        data={convertToTreeData()}
                        onToggle={onToggle}
                        theme={treeTheme}
                    />
                </div>
            ) : (
                <div className="class-list">
                    {structure.map((classItem) => renderClass(classItem))}
                </div>
            )}

            <div className="add-class-section">
                <h3 className="add-class-title">Add New Class</h3>
                <div className="form-group">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Class Name"
                        className="form-input"
                    />
                    <button onClick={handleAddClass} className="button button-blue">
                        <FaPlus /> Add Class
                    </button>
                    <button onClick={handleAddParent} className="button button-green">
                        <FaPlus /> Add Parent
                    </button>
                </div>
                {newClassParents.map((parent, index) => (
                    <div key={index} className="parent-class-item">
                        <input
                            type="text"
                            value={parent.name}
                            onChange={(e) =>
                                setNewClassParents((prev) =>
                                    prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p))
                                )
                            }
                            placeholder="Parent Class Name"
                            className="form-input"
                        />
                        <select
                            value={parent.inheritanceType}
                            onChange={(e) =>
                                setNewClassParents((prev) =>
                                    prev.map((p, i) => (i === index ? { ...p, inheritanceType: e.target.value } : p))
                                )
                            }
                            className="form-select"
                        >
                            <option value="public">Public</option>
                            <option value="protected">Protected</option>
                            <option value="private">Private</option>
                        </select>
                        <button
                            onClick={() => setNewClassParents((prev) => prev.filter((_, i) => i !== index))}
                            className="button button-red"
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
