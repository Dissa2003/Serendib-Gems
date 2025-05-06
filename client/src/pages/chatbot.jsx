import React, { useState, useRef, useEffect } from 'react';
import './css/chatbot.css';
import Navbar from './Navbar';
import Footer from './footer';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Sri Lankan Gem Assistant. Ask me about gems, their history, pricing, or anything else!", sender: 'bot' }
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
        console.log('Step 1: Attempting to load Pyodide...');
        if (!window.loadPyodide) {
          throw new Error('Pyodide CDN not loaded. Check network or CDN URL.');
        }
        const pyodideInstance = await window.loadPyodide();
        console.log('Step 2: Pyodide loaded successfully.');

        console.log('Step 3: Fetching chatbot.py...');
        const response = await fetch('/chatbot.py');
        if (!response.ok) {
          throw new Error(`Failed to fetch chatbot.py: ${response.status} ${response.statusText}`);
        }
        const pythonCode = await response.text();
        console.log('Step 4: chatbot.py fetched.');

        console.log('Step 5: Executing chatbot.py...');
        await pyodideInstance.runPythonAsync(pythonCode);
        console.log('Step 6: chatbot.py executed.');

        setPyodide(pyodideInstance);
        toast.success('Chatbot initialized.');
      } catch (error) {
        console.error(`Error loading Pyodide: ${error.message}`, error);
        setMessages((prev) => [
          ...prev,
          { text: `Failed to initialize chatbot: ${error.message}. Using basic JavaScript mode.`, sender: 'bot' }
        ]);
        toast.error(`Failed to initialize chatbot: ${error.message}`);
      }
    }
    loadPyodideAndChatbot();
  }, []);

  // Fallback JavaScript-based response
  const fallbackResponse = (query) => {
    console.log('fallbackResponse: Processing query:', query);
    if (!query || typeof query !== 'string') {
      console.warn('fallbackResponse: Invalid query, returning default response');
      return 'Sorry, invalid input. Please try again.';
    }
    query = query.toLowerCase();
    if (query.includes('blue sapphire')) {
      return 'Ceylon Blue Sapphires are prized for their vivid cornflower blue hue, exceptional clarity, and brilliance.';
    } else if (query.includes('padparadscha')) {
      return 'Padparadscha sapphires, unique to Sri Lanka, exhibit a rare pink-orange hue resembling a lotus blossom.';
    } else if (query.includes('mining')) {
      return 'Traditional Sri Lankan gem mining, known as "illama," involves hand-dug pits to reach gem-rich gravel.';
    } else if (query.includes('sri lanka') || query.includes('ceylon')) {
      return 'Sri Lanka, historically known as Ceylon, is dubbed "Ratna-Dweepa" (Gem Island) for its rich gem deposits.';
    } else if (query.includes('ratnapura')) {
      return 'Ratnapura, the "City of Gems," is Sri Lanka’s gem trade hub.';
    } else if (query.includes('certification') || query.includes('authenticity')) {
      return 'All gems are certified by the National Gem and Jewellery Authority (NGJA) or GIA, ensuring authenticity.';
    } else if (query.includes('ethical') || query.includes('sustainability')) {
      return 'Sri Lanka’s gem mining is among the most sustainable globally, using small-scale operations.';
    } else if (query.includes('pricing') || query.includes('cost')) {
      return 'Gem prices depend on the 4Cs: Cut, Color, Clarity, and Carat.';
    } else if (query.includes('sapphire') && query.includes('color')) {
      return 'Sri Lankan sapphires come in various colors: cornflower blue, yellow, pink, purple, green, and colorless.';
    } else {
      return 'Sorry, I’m in basic mode. Ask about blue sapphires, padparadscha, mining, or other gem topics!';
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setInput('');

    try {
      console.log('handleSend: Processing input:', input);
      let response;
      if (pyodide) {
        console.log('handleSend: Checking document.process_message:', pyodide.globals.get('document').process_message);
        response = await pyodide.globals.get('document').process_message(input);
      } else {
        response = fallbackResponse(input);
      }
      console.log('handleSend: Response:', response);
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
    console.log('handleSuggestion: Processing question:', question);
    if (!question || typeof question !== 'string') {
      console.error('handleSuggestion: Invalid question');
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, invalid suggestion. Please try again.', sender: 'bot' }
      ]);
      toast.error('Invalid suggestion.');
      setIsTyping(false);
      return;
    }

    const userMessage = { text: question, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log('handleSuggestion: Pyodide available:', !!pyodide);
      let response;
      if (pyodide) {
        console.log('handleSuggestion: Checking document.process_message:', pyodide.globals.get('document').process_message);
        response = await pyodide.globals.get('document').process_message(question);
        console.log('handleSuggestion: Response received:', response);
      } else {
        console.log('handleSuggestion: Using fallback...');
        response = fallbackResponse(question);
      }
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
            disabled={isTyping}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={isTyping}>
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