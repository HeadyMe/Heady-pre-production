/**
 * HeadyBuddy Mobile - Main App Component
 * React Native Android App
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import TaskCard from './components/TaskCard';
import ChatBubble from './components/ChatBubble';
import StatusIndicator from './components/StatusIndicator';
import QuickActionButton from './components/QuickActionButton';

// Services
import HeadyService from './services/HeadyService';

const App = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm HeadyBuddy Mobile! 🚀 I'm here to help you stay productive on the go!", sender: 'buddy', time: new Date() }
  ]);
  const [headyStatus, setHeadyStatus] = useState({ connected: false });
  const [breathingAnim] = useState(new Animated.Value(1));

  // Breathing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Check HeadyManager status
  useEffect(() => {
    checkHeadyStatus();
    const interval = setInterval(checkHeadyStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHeadyStatus = async () => {
    try {
      const status = await HeadyService.getStatus();
      setHeadyStatus(status);
    } catch (error) {
      setHeadyStatus({ connected: false });
    }
  };

  // Task Management
  const addTask = () => {
    if (!taskInput.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: taskInput,
      createdAt: new Date(),
      completed: false
    };
    
    setCurrentTask(newTask);
    setTaskInput('');
    
    // Buddy encouragement
    const encouragements = [
      "Great task! You've got this! 💪",
      "Nice! Let's crush it! 🔥",
      "Perfect! Stay focused! ✨"
    ];
    addMessage(encouragements[Math.floor(Math.random() * encouragements.length)], 'buddy');
  };

  const completeTask = () => {
    if (currentTask) {
      setCurrentTask({ ...currentTask, completed: true, completedAt: new Date() });
      
      const completions = [
        "Task complete! Awesome work! 🎉",
        "Done! You're on fire! 🔥",
        "Completed! Keep the momentum! 🚀"
      ];
      addMessage(completions[Math.floor(Math.random() * completions.length)], 'buddy');
      
      setTimeout(() => setCurrentTask(null), 3000);
    }
  };

  const clearTask = () => {
    setCurrentTask(null);
  };

  // Chat System
  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      time: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    addMessage(chatInput, 'user');
    setChatInput('');
    
    // Process and respond
    processUserMessage(chatInput);
  };

  const processUserMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    
    setTimeout(() => {
      if (lowerMsg.includes('sync')) {
        addMessage("Syncing your repositories... 🔄", 'buddy');
      } else if (lowerMsg.includes('build')) {
        addMessage("Building your projects... 🔨", 'buddy');
      } else if (lowerMsg.includes('deploy')) {
        addMessage("Deploying to production... 🚀", 'buddy');
      } else if (lowerMsg.includes('status')) {
        addMessage(headyStatus.connected ? "HeadyManager is online! 💚" : "HeadyManager is offline. Start it locally! 💛", 'buddy');
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        addMessage("Hey there! Ready to be productive? 🌟", 'buddy');
      } else {
        addMessage("I'm here to help! Try asking about sync, build, deploy, or status! 💡", 'buddy');
      }
    }, 500);
  };

  // Quick Actions
  const runQuickAction = (action) => {
    const messages = {
      sync: "Running HeadySync... 🔄",
      build: "Building projects... 🔨",
      deploy: "Deploying to Render... 🚀",
      checkpoint: "Creating checkpoint... 📍"
    };
    addMessage(messages[action], 'buddy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Sacred Geometry Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#1a1a2e']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatarContainer, { opacity: breathingAnim }]}>
          <LinearGradient
            colors={['#00d4ff', '#7b2cbf']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>🧠</Text>
          </LinearGradient>
          <View style={styles.statusDot} />
        </Animated.View>
        
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>HeadyBuddy</Text>
          <Text style={styles.headerSubtitle}>Mobile Companion</Text>
        </View>
        
        <StatusIndicator connected={headyStatus.connected} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Task */}
          <TaskCard 
            task={currentTask}
            onComplete={completeTask}
            onClear={clearTask}
          />
          
          {!currentTask && (
            <View style={styles.taskInputContainer}>
              <TextInput
                style={styles.taskInput}
                placeholder="What are you working on?"
                placeholderTextColor="#666"
                value={taskInput}
                onChangeText={setTaskInput}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Icon name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <QuickActionButton 
              icon="sync" 
              label="Sync" 
              onPress={() => runQuickAction('sync')} 
            />
            <QuickActionButton 
              icon="hammer" 
              label="Build" 
              onPress={() => runQuickAction('build')} 
            />
            <QuickActionButton 
              icon="rocket-launch" 
              label="Deploy" 
              onPress={() => runQuickAction('deploy')} 
            />
            <QuickActionButton 
              icon="map-marker" 
              label="Checkpoint" 
              onPress={() => runQuickAction('checkpoint')} 
            />
          </View>

          {/* Chat */}
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>💬 Buddy Chat</Text>
            
            <ScrollView style={styles.chatMessages}>
              {messages.map(msg => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </ScrollView>
            
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask me anything..."
                placeholderTextColor="#666"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ecdc4',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  taskInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  taskInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  chatSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  chatMessages: {
    maxHeight: 200,
    marginBottom: 12,
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
