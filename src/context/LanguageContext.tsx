import React, { createContext, useContext, useState, ReactNode } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, any>;
};

const translations = {
  en: {
    title: 'Settings',
    createRoom: 'Create Room',
    settings: 'Settings',
    about: 'About',
    yourName: 'Your name',
    roomName: 'Room name',
    createRoomTitle: 'Create a Room',
    numberInputPhase: 'Number Input Phase',
    discussionPhase: 'Discussion Phase',
    votingPhase: 'Voting Phase',
    resultsPhase: 'Results Phase',
    yourAnswer: 'Your answer was',
    waitingForPlayers: 'Wait for other players to submit their answers...',
    enterAnswerPlaceholder: 'Enter your answer...',
    typeMessage: 'Type your message...',
    sendMessage: 'Send',
    inviteLinkCopied: 'Invite link copied to clipboard!',
    aboutGame: 'Impostors is a social deduction game where players try to identify who among them is giving false answers.',
    language: 'Language',
    english: 'English',
    portuguese: 'Portuguese',
    save: 'Save Changes',
    cancel: 'Cancel',
    exitRoom: 'Exit Room',
    addBot: 'Add Bot',
    invitePlayers: 'Invite Players',
    startGame: 'Start Game',
    players: 'Players',
    eliminated: 'Eliminated',
    you: 'You',
    impostor: 'Impostor',
    roleReveal: 'Role Reveal',
    youAreImpostor: 'You are the Impostor!',
    tryToBlendIn: 'Try to blend in!',
    makeUpAnswer: 'Make up a believable answer when asked.',
    youAreNotImpostor: 'You are not the Impostor',
    answerHonestly: 'Answer honestly in the next phase.',
    question: 'Question',
    shareLink: 'Share this link with your friends:',
    copyLink: 'Copy Link',
    roomInfo: 'Room Info',
    playerLimit: 'Player Limit',
    confirmExit: 'Are you sure you want to exit the room?',
    lobbyClosedByHost: 'The lobby was closed by the host',
    lobbyClosedWarning: 'If you leave, the room will close and all players will be kicked out.',
    yes: 'Yes',
    no: 'No',
    enterNumber: 'Enter a number that won\'t raise suspicion',
    submit: 'Submit',
    returnToLobby: 'Return to Lobby',
    everyoneAnswers: 'Everyone\'s Answers:',
    unknownPlayer: 'Unknown Player',
    selectingRandomly: 'Selecting randomly...',
    votes: 'votes',
    vote: 'vote',
    gameQuestions: {
      bestFriendAge: 'How old is your best friend?',
      motherAge: 'What is your mother\'s age?',
      siblings: 'How many siblings do you have?',
      sleepHours: 'How many hours of sleep did you get last night?',
      pets: 'How many pets have you had in your life?',
      birthYear: 'In what year were you born?',
      countries: 'How many countries have you visited?',
      closeFriends: 'How many close friends do you have?',
      coffeeTeaCups: 'How many cups of coffee/tea do you drink per day?',
      shoeSize: 'What\'s your shoe size?'
    }
  },
  pt: {
    title: 'Configurações',
    createRoom: 'Criar Sala',
    settings: 'Configurações',
    about: 'Sobre',
    yourName: 'Seu nome',
    roomName: 'Nome da sala',
    createRoomTitle: 'Criar uma Sala',
    numberInputPhase: 'Fase de Entrada de Números',
    discussionPhase: 'Fase de Discussão',
    votingPhase: 'Fase de Votação',
    resultsPhase: 'Fase de Resultados',
    yourAnswer: 'Sua resposta foi',
    waitingForPlayers: 'Aguarde outros jogadores enviarem suas respostas...',
    enterAnswerPlaceholder: 'Digite sua resposta...',
    typeMessage: 'Digite sua mensagem...',
    sendMessage: 'Enviar',
    inviteLinkCopied: 'Link de convite copiado para a área de transferência!',
    aboutGame: 'Impostors é um jogo de dedução social onde os jogadores tentam identificar quem entre eles está dando respostas falsas.',
    language: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
    save: 'Salvar Alterações',
    cancel: 'Cancelar',
    exitRoom: 'Sair da Sala',
    addBot: 'Adicionar Bot',
    invitePlayers: 'Convidar Jogadores',
    startGame: 'Iniciar Jogo',
    players: 'Jogadores',
    eliminated: 'Eliminado',
    you: 'Você',
    impostor: 'Impostor',
    roleReveal: 'Revelação de Papel',
    youAreImpostor: 'Você é o Impostor!',
    tryToBlendIn: 'Tente se misturar!',
    makeUpAnswer: 'Invente uma resposta convincente quando perguntado.',
    youAreNotImpostor: 'Você não é o Impostor',
    answerHonestly: 'Responda honestamente na próxima fase.',
    question: 'Pergunta',
    shareLink: 'Compartilhe este link com seus amigos:',
    copyLink: 'Copiar Link',
    roomInfo: 'Informações da Sala',
    playerLimit: 'Limite de Jogadores',
    confirmExit: 'Tem certeza que deseja sair da sala?',
    lobbyClosedByHost: 'O lobby foi fechado pelo anfitrião',
    lobbyClosedWarning: 'Se você sair, a sala será fechada e todos os jogadores serão expulsos.',
    yes: 'Sim',
    no: 'Não',
    enterNumber: 'Digite um número que não levante suspeitas',
    submit: 'Enviar',
    returnToLobby: 'Voltar ao Lobby',
    everyoneAnswers: 'Respostas de Todos:',
    unknownPlayer: 'Jogador Desconhecido',
    selectingRandomly: 'Selecionando aleatoriamente...',
    votes: 'votos',
    vote: 'voto',
    gameQuestions: {
      bestFriendAge: 'Qual a idade do seu melhor amigo?',
      motherAge: 'Qual a idade da sua mãe?',
      siblings: 'Quantos irmãos você tem?',
      sleepHours: 'Quantas horas você dormiu na noite passada?',
      pets: 'Quantos animais de estimação você já teve na vida?',
      birthYear: 'Em que ano você nasceu?',
      countries: 'Quantos países você já visitou?',
      closeFriends: 'Quantos amigos próximos você tem?',
      coffeeTeaCups: 'Quantas xícaras de café/chá você bebe por dia?',
      shoeSize: 'Qual é o seu número de calçado?'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  const value = {
    language,
    setLanguage: (lang: string) => {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    },
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};