import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import * as swapService from '../services/swapService';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import Loader from './Loader';

const ChatPanel = ({ swapId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    swapService.getMessages(swapId)
      .then(({ data }) => setMessages(data.messages))
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      socket.emit('join_swap', swapId);
      const handleNew = (msg) => {
        if (msg.swapRequest === swapId || msg.swapRequest?._id === swapId) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      socket.on('new_message', handleNew);
      return () => socket.off('new_message', handleNew);
    }
    return undefined;
  }, [swapId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', { swapId, message: trimmed });
    } else {
      // REST fallback if the socket isn't connected
      const { data } = await swapService.sendMessage(swapId, { message: trimmed });
      setMessages((prev) => [...prev, data.message]);
    }
    setText('');
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-[420px] bg-white border border-moss-100 rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-center text-sm text-ink/30 mt-10">No messages yet. Say hello!</p>}
        {messages.map((msg) => {
          const mine = String(msg.sender._id || msg.sender) === String(user._id);
          return (
            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-pine text-paper rounded-br-sm' : 'bg-moss-50 text-ink rounded-bl-sm'}`}>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-paper/50' : 'text-ink/30'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-moss-100 p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
          className="flex-1 border border-moss-100 rounded-full px-4 py-2 text-sm focus:border-pine outline-none" />
        <button type="submit" className="bg-pine text-paper rounded-full p-2.5 hover:bg-pine-700"><Send size={16} /></button>
      </form>
    </div>
  );
};

export default ChatPanel;
