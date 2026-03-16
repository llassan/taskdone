import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import { FiSend } from 'react-icons/fi';

export default function ChatBox({ taskId, messages: initialMessages = [] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);

  useEffect(() => {
    socket.emit('join-order', taskId);
    const handler = (data) => {
      if (data.orderId === taskId) setMessages(prev => [...prev, data.message]);
    };
    socket.on('new-message', handler);
    return () => { socket.emit('leave-order', taskId); socket.off('new-message', handler); };
  }, [taskId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try { await api.post(`/orders/${taskId}/message`, { text }); setText(''); } catch {}
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-3">Messages</h3>
      <div className="max-h-72 overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
        ) : messages.map((msg, i) => {
          const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe ? 'bg-emerald-500 text-white' : 'bg-white border text-gray-700'}`}>
                {!isMe && <div className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName || msg.sender?.name || msg.senderRole}</div>}
                <p>{msg.text}</p>
                <div className={`text-[10px] mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} className="input-field flex-1" placeholder="Type a message..." />
        <button type="submit" className="btn-primary px-4"><FiSend /></button>
      </form>
    </div>
  );
}
