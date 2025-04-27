import React, { useState } from 'react';
import { Treebeard } from 'react-treebeard';
import { FaFolder, FaFolderOpen, FaCode, FaCog, FaCube } from 'react-icons/fa';
import './style.css';

const CodeStructureViewer = ({ classStructure }) => {
  const [cursor, setCursor] = useState(false);
  const [expanded, setExpanded] = useState({});

  const onToggle = (node, toggled) => {
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setExpanded({ ...expanded, [node.name]: toggled });
  };

  const convertToTreeData = (classStructure) => {
    return {
      name: 'Project Structure',
      toggled: true,
      children: classStructure.map(classItem => ({
        name: classItem.name,
        icon: <FaCube />,
        children: [
          {
            name: 'Properties',
            icon: <FaCog />,
            children: [
              {
                name: 'Public',
                children: [
                  ...classItem.public.attributes.map(attr => ({
                    name: `${attr.type} ${attr.name}`,
                    icon: <FaCode />
                  })),
                  ...classItem.public.methods.map(method => ({
                    name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                    icon: <FaCode />
                  }))
                ]
              },
              {
                name: 'Protected',
                children: [
                  ...classItem.protected.attributes.map(attr => ({
                    name: `${attr.type} ${attr.name}`,
                    icon: <FaCode />
                  })),
                  ...classItem.protected.methods.map(method => ({
                    name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                    icon: <FaCode />
                  }))
                ]
              },
              {
                name: 'Private',
                children: [
                  ...classItem.private.attributes.map(attr => ({
                    name: `${attr.type} ${attr.name}`,
                    icon: <FaCode />
                  })),
                  ...classItem.private.methods.map(method => ({
                    name: `${method.returnType} ${method.name}(${method.params.join(', ')})`,
                    icon: <FaCode />
                  }))
                ]
              }
            ]
          },
          classItem.parents && classItem.parents.length > 0 && {
            name: 'Inheritance',
            icon: <FaCube />,
            children: classItem.parents.map(parent => ({
              name: `${parent.inheritanceType} ${parent.name}`,
              icon: <FaCube />
            }))
          }
        ].filter(Boolean)
      }))
    };
  };

  const customTheme = {
    tree: {
      base: {
        listStyle: 'none',
        backgroundColor: '#252526',
        color: '#d4d4d4',
        fontSize: '14px',
        padding: '10px'
      },
      node: {
        base: {
          position: 'relative',
          padding: '4px 8px'
        },
        link: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '2px 0'
        },
        activeLink: {
          background: '#37373d'
        },
        toggle: {
          base: {
            display: 'inline-block',
            width: '0',
            height: '0'
          },
          wrapper: {
            margin: '-7px 0 0 -7px'
          }
        },
        header: {
          base: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }
      }
    }
  };

  return (
    <div className="code-structure-viewer">
      <Treebeard
        data={convertToTreeData(classStructure)}
        onToggle={onToggle}
        style={customTheme}
      />
    </div>
  );
};

export default CodeStructureViewer;