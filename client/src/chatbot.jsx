import React, { useState, useRef, useEffect } from 'react';
import './pages/css/chatbot.css';
import Navbar from './pages/Navbar';
import Footer from './pages/footer';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your advanced Sri Lankan Gem Assistant. Ask me about gems, their history, pricing, or anything else!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Pyodide and load chatbot.py
  useEffect(() => {
    async function loadPyodideAndChatbot() {
      try {
        const pyodideInstance = await window.loadPyodide();
        await pyodideInstance.loadPackage('micropip');
        await pyodideInstance.runPythonAsync(`
          import micropip
          await micropip.install('transformers')
          await micropip.install('numpy')
          await micropip.install('scikit-learn')
        `);
        // Load chatbot.py from public folder
        const response = await fetch('/chatbot.py');
        if (!response.ok) throw new Error('Failed to fetch chatbot.py');
        const pythonCode = await response.text();
        await pyodideInstance.runPythonAsync(pythonCode);
        setPyodide(pyodideInstance);
        toast.success('Chatbot initialized successfully!');
      } catch (error) {
        console.error('Error loading Pyodide:', error);
        setMessages((prev) => [
          ...prev,
          { text: 'Failed to initialize chatbot. Please try again later.', sender: 'bot' }
        ]);
        toast.error('Failed to initialize chatbot.');
      }
    }
    if (window.loadPyodide) {
      loadPyodideAndChatbot();
    } else {
      toast.error('Pyodide not available. Please check your network.');
    }
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || !pyodide) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setInput('');

    try {
      const response = await pyodide.globals.get('document').process_message(input);
      setMessages((prev) => [...prev, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' }
      ]);
      toast.error('Error processing message.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = async (question) => {
    if (!pyodide) return;

    const userMessage = { text: question, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await pyodide.globals.get('document').process_message(question);
      setMessages((prev) => [...prev, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error processing suggestion:', error);
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' }
      ]);
      toast.error('Error processing suggestion.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div>
      <Navbar />
      <div className="chatbot-container container my-4">
        <div className="chatbot-header text-center">
          <h2>Sri Lankan Gem Assistant</h2>
          <p>Ask me anything about Sri Lankan gems, their history, pricing, or buying and selling!</p>
        </div>

        <div className="chatbot-messages card p-3">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className={`message-bubble ${message.sender === 'bot' ? 'bg-primary text-white' : 'bg-light'}`}>
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <div className="message-bubble bg-primary text-white">Typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input input-group mt-3">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={!pyodide || isTyping}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!pyodide || isTyping}>
            <i className="fas fa-paper-plane"></i> Send
          </button>
        </div>

        <div className="chatbot-suggestions mt-3">
          <p>Suggested questions:</p>
          <div className="suggestion-buttons d-flex flex-wrap gap-2">
            <button className="btn btn-outline-primary" onClick={() => handleSuggestion("Tell me about Sri Lankan blue sapphires")}>
              Blue Sapphires
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleSuggestion("What is a Padparadscha sapphire?")}>
              Padparadscha Sapphires
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleSuggestion("History of gem mining in Sri Lanka")}>
              Gem Mining History
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleSuggestion("How are Sri Lankan gems authenticated?")}>
              Gem Authentication
            </button>
            <button className="btn btn-outline-primary" onClick={() => handleSuggestion("Are Sri Lankan gems ethically sourced?")}>
              Ethical Sourcing
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chatbot;