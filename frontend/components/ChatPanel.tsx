'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { FiMic, FiSend, FiVolume2 } from 'react-icons/fi';
import { askChat, synthesizeVoice, transcribeAudio } from '../lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface Props {
  filters: Record<string, unknown>;
  quickPrompts?: string[];
}

export function ChatPanel({ filters, quickPrompts = [] }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const assistantBg = useColorModeValue('purple.50', 'purple.900');
  const userBg = useColorModeValue('gray.100', 'gray.700');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    try {
      const response = await askChat({ question, ...filters });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.narrative }]);
      speakResponse(response.narrative);
    } catch (err) {
      toast({
        title: 'Chat failed',
        description: (err as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      const voice = await synthesizeVoice(text);
      if (voice.available && voice.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${voice.audio_base64}`);
        await audio.play();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Voice synthesis failed', err);
    }
  };

  const handleVoiceInput = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !(window as any).MediaRecorder) {
      toast({
        title: 'Voice unavailable',
        description: 'Microphone access is not supported in this browser.',
        status: 'info',
      });
      return;
    }
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const response = await transcribeAudio(blob);
          if (response.success && response.text) {
            setInput(response.text);
          } else {
            toast({
              title: 'Transcription unavailable',
              description: response.message,
              status: 'warning',
            });
          }
        } catch (err) {
          toast({
            title: 'Transcription failed',
            description: (err as Error).message,
            status: 'error',
          });
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        title: 'Microphone access denied',
        description: (err as Error).message,
        status: 'error',
      });
    }
  };

  return (
    <Box
      bg={cardBg}
      borderRadius='lg'
      p={5}
      boxShadow='sm'
      height='100%'
      borderWidth='1px'
      borderColor={borderColor}
    >
      <Flex justify='space-between' align='center' mb={4}>
        <Text fontWeight='semibold'>Talking Rabbitt</Text>
        <HStack spacing={2}>
          <IconButton
            aria-label='Voice input'
            icon={<FiMic />}
            size='sm'
            variant={isRecording ? 'solid' : 'ghost'}
            colorScheme={isRecording ? 'red' : undefined}
            onClick={handleVoiceInput}
          />
          <IconButton
            aria-label='Speak'
            icon={<FiVolume2 />}
            size='sm'
            variant='ghost'
            onClick={() =>
              messages.length && speakResponse(messages[messages.length - 1].content)
            }
          />
        </HStack>
      </Flex>

      <VStack align='stretch' spacing={3} height='360px' overflowY='auto' mb={4}>
        {messages.length === 0 && (
          <Text fontSize='sm' color={emptyTextColor}>
            Ask me anything about last quarter performance, promo effectiveness, or
            regional outliers.
          </Text>
        )}
        {messages.map((msg, idx) => (
          <Box
            key={`${msg.role}-${idx}`}
            alignSelf={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
            bg={msg.role === 'assistant' ? assistantBg : userBg}
            px={4}
            py={2}
            borderRadius='lg'
          >
            <Text fontSize='sm'>{msg.content}</Text>
          </Box>
        ))}
      </VStack>

      {quickPrompts.length > 0 && (
        <HStack spacing={2} mb={3} overflowX='auto'>
          {quickPrompts.map((prompt) => (
            <Button key={prompt} size='sm' variant='ghost' onClick={() => setInput(prompt)}>
              {prompt}
            </Button>
          ))}
        </HStack>
      )}

      <HStack>
        <Input
          placeholder='Ask Rabbitt...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          bg={inputBg}
          _placeholder={{ color: placeholderColor }}
        />
        <Button colorScheme='purple' onClick={handleSend} isLoading={loading} rightIcon={<FiSend />}>
          Send
        </Button>
      </HStack>
    </Box>
  );
}

