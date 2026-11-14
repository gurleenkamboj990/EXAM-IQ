import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export const useWebSocket = ({ examId, onEvent, isEnabled = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const isMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

  // Mock Simulated Emitter
  useEffect(() => {
    if (!isEnabled) return;

    if (isMock) {
      setIsConnected(true);

      const MOCK_EVENTS = [
        { type: 'TAB_SWITCH', studentName: 'Rahul Sharma', message: 'Switched to unauthorized browser window', severity: 'HIGH' },
        { type: 'FACE_NOT_DETECTED', studentName: 'David Alaba', message: 'Face moved out of webcam field of view', severity: 'MEDIUM' },
        { type: 'PROGRESS', studentName: 'Alex Morgan', message: 'Submitted answer for Question 4', severity: 'INFO' },
        { type: 'WINDOW_BLUR', studentName: 'Elena Rostova', message: 'Exam screen focus momentarily lost', severity: 'LOW' },
        { type: 'MULTIPLE_FACES', studentName: 'Rahul Sharma', message: 'Multiple individuals observed in webcam frame', severity: 'HIGH' },
        { type: 'PROGRESS', studentName: 'Priya Patel', message: 'Completed all 6 assessment items', severity: 'SUCCESS' },
      ];

      let eventIndex = 0;
      const interval = setInterval(() => {
        const template = MOCK_EVENTS[eventIndex % MOCK_EVENTS.length];
        const event = {
          id: `evt_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          ...template,
        };

        if (onEventRef.current) {
          onEventRef.current(event);
        }
        eventIndex++;
      }, 5000);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    }

    // Live STOMP Client when VITE_USE_MOCK=false
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws-exam';
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        if (examId) {
          client.subscribe(`/topic/exam/${examId}/monitor`, (message) => {
            try {
              const data = JSON.parse(message.body);
              if (onEventRef.current) {
                onEventRef.current(data);
              }
            } catch (err) {
              console.error('Failed to parse websocket message:', err);
            }
          });
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error:', frame);
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      setIsConnected(false);
    };
  }, [examId, isEnabled, isMock]);

  return { isConnected };
};

export default useWebSocket;

