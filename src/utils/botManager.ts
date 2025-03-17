import { Player, GamePhase } from '../context/GameContext';

// Bot name generation
const botNames = ['Bot Alice', 'Bot Bob', 'Bot Charlie', 'Bot David', 'Bot Eve'];
const usedNames = new Set<string>();

const getUniqueBotName = (): string => {
  const availableNames = botNames.filter(name => !usedNames.has(name));
  if (availableNames.length === 0) {
    const name = `Bot ${Math.random().toString(36).substring(7)}`;
    usedNames.add(name);
    return name;
  }
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  usedNames.add(name);
  return name;
};

// Create a new bot player
export const createBot = (): Player => ({
  id: `bot-${Math.random().toString(36).substring(7)}`,
  name: getUniqueBotName(),
  isImpostor: Math.random() < 0.3, // 30% chance to be impostor
  isAlive: true,
  hasVoted: false
});

// Generate bot answer for questions
export const generateBotAnswer = (question: string): string => {
  const genericAnswers = [
    'I think that sounds reasonable',
    'Based on my analysis, that makes sense',
    'I disagree with that approach',
    'I\'m not entirely sure about that',
    'Let me think about it more'
  ];
  return genericAnswers[Math.floor(Math.random() * genericAnswers.length)];
};

// Bot voting logic
export const getBotVote = (botId: string, players: Player[]): string => {
  const alivePlayers = players.filter(p => p.isAlive && p.id !== botId);
  if (alivePlayers.length === 0) return '';
  return alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
};

// Check if a player is a bot
export const isBot = (playerId: string): boolean => {
  return playerId.startsWith('bot-');
};