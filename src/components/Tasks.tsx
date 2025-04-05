import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const Task = ({ position, id, onComplete, isActive, isCompleted }) => {
  const [hover, setHover] = useState(false);
  const [interactionProgress, setInteractionProgress] = useState(0);
  const [interactionActive, setInteractionActive] = useState(false);
  
  // Reset interaction progress when task is no longer active
  useEffect(() => {
    if (!isActive) {
      setInteractionProgress(0);
      setInteractionActive(false);
    }
  }, [isActive]);
  
  // Handle task completion progress
  useEffect(() => {
    let progressInterval;
    
    if (interactionActive && isActive && !isCompleted) {
      progressInterval = setInterval(() => {
        setInteractionProgress(prev => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            onComplete(id);
            return 100;
          }
          return newProgress;
        });
      }, 50);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [interactionActive, isActive, isCompleted, id, onComplete]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'e' && hover && isActive && !isCompleted) {
      setInteractionActive(true);
    }
  };
  
  const handleKeyUp = (e) => {
    if (e.key === 'e') {
      setInteractionActive(false);
    }
  };
  
  // Add keyboard event listeners when hovering
  useEffect(() => {
    if (hover) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    } else {
      setInteractionActive(false);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hover, isActive, isCompleted]);
  
  return (
    <group position={position}>
      {/* Task object */}
      <mesh 
        castShadow 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={isCompleted ? 0x0000ff : isActive ? (hover ? 0xffff00 : 0x00ff00) : 0x888888} 
          emissive={hover && isActive && !isCompleted ? 0x555500 : 0x000000}
        />
      </mesh>
      
      {/* Progress indicator */}
      {hover && isActive && !isCompleted && (
        <group position={[0, 1.5, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Press E to interact
          </Text>
          
          {/* Progress bar background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1, 0.2]} />
            <meshBasicMaterial color={0x333333} />
          </mesh>
          
          {/* Progress bar fill */}
          {interactionProgress > 0 && (
            <mesh position={[-0.5 + (interactionProgress / 100) * 0.5, 0, 0.01]}>
              <planeGeometry args={[interactionProgress / 100, 0.2]} />
              <meshBasicMaterial color={0x00ff00} />
            </mesh>
          )}
        </group>
      )}
      
      {/* Completed indicator */}
      {isCompleted && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Completed
        </Text>
      )}
    </group>
  );
};

const TaskManager = ({ tasks, playerPosition, onTaskComplete, isImpostor }) => {
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const activationDistance = 3; // How close player needs to be to interact with task
  
  // Check which tasks are within activation range
  useEffect(() => {
    if (isImpostor) return; // Impostors can't do tasks
    
    if (playerPosition) {
      const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
      
      const nearbyTasks = tasks.filter(task => {
        const taskPos = new THREE.Vector3(task.position[0], task.position[1], task.position[2]);
        return playerPos.distanceTo(taskPos) < activationDistance;
      }).map(task => task.id);
      
      setActiveTasks(nearbyTasks);
    }
  }, [playerPosition, tasks, isImpostor]);
  
  const handleTaskComplete = (taskId) => {
    setCompletedTasks(prev => [...prev, taskId]);
    onTaskComplete(taskId);
  };
  
  return (
    <group>
      {tasks.map((task) => (
        <Task
          key={task.id}
          id={task.id}
          position={task.position}
          isActive={activeTasks.includes(task.id)}
          isCompleted={completedTasks.includes(task.id)}
          onComplete={handleTaskComplete}
        />
      ))}
    </group>
  );
};

export { Task, TaskManager };