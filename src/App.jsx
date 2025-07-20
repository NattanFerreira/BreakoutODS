import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- DADOS E CONSTANTES DO JOGO (sem alterações) ---
const ODS_DATA = [
    { id: 1, title: 'Erradicação da Pobreza', info: 'Acabar com a pobreza em todas as suas formas, em todos os lugares.', color: '#E5243B' },
    { id: 2, title: 'Fome Zero', info: 'Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável.', color: '#DDA63A' },
    { id: 3, title: 'Saúde e Bem-Estar', info: 'Assegurar uma vida saudável e promover o bem-estar para todos, em todas as idades.', color: '#4C9F38' },
    { id: 4, title: 'Educação de Qualidade', info: 'Assegurar a educação inclusiva e equitativa de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todos.', color: '#C5192D' },
    { id: 5, title: 'Igualdade de Gênero', info: 'Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas.', color: '#FF3A21' },
    { id: 6, title: 'Água Potável e Saneamento', info: 'Assegurar a disponibilidade e gestão sustentável da água e saneamento para todos.', color: '#26BDE2' },
    { id: 7, title: 'Energia Limpa e Acessível', info: 'Assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todos.', color: '#FCC30B' },
    { id: 8, title: 'Trabalho Decente', info: 'Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo e trabalho decente para todos.', color: '#A21942' },
    { id: 9, title: 'Inovação e Infraestrutura', info: 'Construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação.', color: '#FD6925' },
    { id: 10, 'title': 'Redução das Desigualdades', info: 'Reduzir a desigualdade dentro dos países e entre eles.', color: '#DD1367' },
    { id: 11, 'title': 'Cidades Sustentáveis', info: 'Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis.', color: '#FD9D24' },
    { id: 12, 'title': 'Consumo Responsável', info: 'Assegurar padrões de produção e de consumo sustentáveis.', color: '#BF8B2E' },
    { id: 13, 'title': 'Ação Climática', info: 'Tomar medidas urgentes para combater a mudança climática e seus impactos.', color: '#3F7E44' },
    { id: 14, 'title': 'Vida na Água', info: 'Conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável.', color: '#0A97D9' },
    { id: 15, 'title': 'Vida Terrestre', info: 'Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres.', color: '#56C02B' },
    { id: 16, 'title': 'Paz e Justiça', info: 'Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável.', color: '#00689D' },
    { id: 17, 'title': 'Parcerias', info: 'Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável.', color: '#19486A' },
];

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 20;
const BALL_SIZE = 20;
const INITIAL_LIVES = 3;

const createBricks = () => {
    // ... (sem alterações)
    const bricks = [];
    const brickRows = 5;
    const bricksPerRow = 8;
    const brickWidth = 80;
    const brickHeight = 25;
    const brickPadding = 12;
    const offsetTop = 50;
    const offsetLeft = (GAME_WIDTH - (bricksPerRow * (brickWidth + brickPadding))) / 2 + brickPadding / 2;
    let odsIndex = 0;
    for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < bricksPerRow; c++) {
            if (odsIndex >= ODS_DATA.length * 2) break;
            const ods = ODS_DATA[odsIndex % ODS_DATA.length];
            bricks.push({ x: c * (brickWidth + brickPadding) + offsetLeft, y: r * (brickHeight + brickPadding) + offsetTop, w: brickWidth, h: brickHeight, ods: ods, isVisible: true });
            odsIndex++;
        }
    }
    return bricks;
};

// --- COMPONENTE PRINCIPAL DO JOGO ---

export default function App() {
  // --- ESTADOS DO JOGO ---
  const [paddleX, setPaddleX] = useState((GAME_WIDTH - PADDLE_WIDTH) / 2);
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2, dx: 0, dy: 0 });
  const [bricks, setBricks] = useState(createBricks());
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [popupInfo, setPopupInfo] = useState(null); 
  // <-- MUDANÇA 1: Novo estado para rastrear ODS já vistos
  const [seenOdsIds, setSeenOdsIds] = useState([]);

  const gameAreaRef = useRef(null);
  const requestRef = useRef();

  // --- FUNÇÕES DE CONTROLE DO JOGO ---

  const resetBallAndPaddle = useCallback(() => {
    setGameState('paused');
    setPaddleX((GAME_WIDTH - PADDLE_WIDTH) / 2);
    setBall({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT - PADDLE_HEIGHT - 100, dx: 0, dy: 0 });
  }, []);

  const launchBall = () => {
    if (gameState === 'paused' || gameState === 'start') {
      setGameState('playing');
      setBall(prev => ({ ...prev, dx: 4, dy: -4 }));
    }
  }

  const restartGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setBricks(createBricks());
    setPopupInfo(null);
    // <-- MUDANÇA 2: Limpa a lista de ODS vistos ao reiniciar o jogo
    setSeenOdsIds([]);
    setGameState('start');
    resetBallAndPaddle();
  }, [resetBallAndPaddle]);

  const closePopupAndResume = () => {
    setPopupInfo(null);
    setGameState('playing');
  };

  // --- LÓGICA DO JOGO (GAME LOOP) ---
  useEffect(() => {
    const gameLoop = () => {
      if (gameState !== 'playing') return;

      let newBall = { ...ball };
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // Colisões com paredes e raquete (sem alterações)
      if (newBall.x <= 0 || newBall.x >= GAME_WIDTH - BALL_SIZE) newBall.dx = -newBall.dx;
      if (newBall.y <= 0) newBall.dy = -newBall.dy;
      if (newBall.y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT && newBall.y < GAME_HEIGHT - PADDLE_HEIGHT / 2 && newBall.x + BALL_SIZE > paddleX && newBall.x < paddleX + PADDLE_WIDTH) {
          newBall.dy = -newBall.dy;
          let collidePoint = newBall.x - (paddleX + PADDLE_WIDTH / 2);
          newBall.dx = collidePoint * 0.1;
      }
      if (newBall.y >= GAME_HEIGHT) {
          setLives(prev => prev - 1);
          if (lives - 1 > 0) { resetBallAndPaddle(); } else { setGameState('gameOver'); }
          return;
      }

      // <-- MUDANÇA 3: Lógica de colisão com os tijolos atualizada
      for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        if (brick.isVisible) {
          if (
            newBall.x + BALL_SIZE > brick.x &&
            newBall.x < brick.x + brick.w &&
            newBall.y + BALL_SIZE > brick.y &&
            newBall.y < brick.y + brick.h
          ) {
            // Ações que sempre ocorrem ao quebrar um tijolo
            newBall.dy = -newBall.dy;
            const updatedBricks = [...bricks];
            updatedBricks[i].isVisible = false;
            setBricks(updatedBricks);
            setScore(prev => prev + 10);
            
            const odsId = brick.ods.id;
            // Verifica se este ODS já foi visto nesta partida
            if (!seenOdsIds.includes(odsId)) {
              // Se for novo, adicione à lista, pause e mostre o pop-up
              setSeenOdsIds(prev => [...prev, odsId]);
              setGameState('paused'); 
              setPopupInfo(brick.ods);
            }
            // Se o ODS já foi visto, o jogo simplesmente continua sem interrupção.

            break; // Sai do loop para processar apenas um tijolo por frame
          }
        }
      }
      
      setBall(newBall);

      if (bricks.every(b => !b.isVisible)) {
        setGameState('win');
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);

  }, [ball, bricks, paddleX, gameState, lives, resetBallAndPaddle, seenOdsIds]); // Adicionado seenOdsIds às dependências

  // --- CONTROLES E RENDERIZAÇÃO (sem alterações no resto do código) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
        if (!gameAreaRef.current || gameState !== 'playing') return;
      const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
      let newPaddleX = e.clientX - gameAreaRect.left - PADDLE_WIDTH / 2;
      if (newPaddleX < 0) newPaddleX = 0;
      if (newPaddleX > GAME_WIDTH - PADDLE_WIDTH) newPaddleX = GAME_WIDTH - PADDLE_WIDTH;
      setPaddleX(newPaddleX);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameState]);

   useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if(popupInfo) return; // Não faz nada se o popup estiver aberto
        if(gameState === 'start' || gameState === 'paused') launchBall();
        if(gameState === 'gameOver' || gameState === 'win') restartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, restartGame, popupInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-mono p-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-cyan-300">ODS Breakout</h1>
        <p className="text-gray-400">Quebre as barreiras para um futuro sustentável!</p>
      </div>
      <div
        ref={gameAreaRef}
        className="relative bg-black border-4 border-cyan-500 shadow-lg shadow-cyan-500/20 cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={launchBall}
      >
        {bricks.map((brick, index) =>
          brick.isVisible && (
            <div key={index} className="absolute rounded-sm" style={{ left: brick.x, top: brick.y, width: brick.w, height: brick.h, backgroundColor: brick.ods.color, boxShadow: `0 0 8px ${brick.ods.color}aa` }} />
          )
        )}
        <div className="absolute bg-cyan-400 rounded-md" style={{ left: paddleX, bottom: 0, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }} />
        <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE, boxShadow: '0 0 10px #fff, 0 0 20px #fff' }} />
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 p-4">
            <h2 className="text-5xl font-bold text-white mb-4 animate-pulse">Pronto para começar?</h2>
            <button onClick={(e) => { e.stopPropagation(); launchBall(); }} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xl shadow-lg"> Iniciar Jogo </button>
            <p className="mt-4 text-gray-300">Mova o mouse para controlar. Clique para lançar.</p>
          </div>
        )}
        {gameState === 'paused' && lives > 0 && !popupInfo && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/50">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Pronto?</h2>
            <p className="mt-2 text-gray-200">Clique ou aperte Espaço para lançar!</p>
          </div>
        )}
        {(gameState === 'gameOver' || gameState === 'win') && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/80 p-4">
            <h2 className={`text-6xl font-bold mb-4 ${gameState === 'win' ? 'text-green-400' : 'text-red-500'}`}> {gameState === 'win' ? 'Você Venceu!' : 'Fim de Jogo'} </h2>
            <p className="text-xl mb-6">Pontuação Final: {score}</p>
            <button onClick={(e) => { e.stopPropagation(); restartGame(); }} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg text-xl shadow-lg"> Jogar Novamente </button>
          </div>
        )}
      </div>
      <div className="flex justify-between w-full mt-4" style={{maxWidth: GAME_WIDTH}}>
        <div className="text-2xl font-bold">Pontos: <span className="text-yellow-400">{score}</span></div>
        <div className="text-2xl font-bold">Vidas: <span className="text-red-500">{'❤️'.repeat(lives)}</span></div>
      </div>
      {popupInfo && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={closePopupAndResume} >
          <div onClick={(e) => e.stopPropagation()} className="p-6 rounded-lg text-center max-w-md border-2 bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-cyan-500/20" style={{borderColor: popupInfo.color}}>
            <h3 className="text-xl font-bold mb-2" style={{color: popupInfo.color}}> ODS {popupInfo.id}: {popupInfo.title} </h3>
            <p className="text-gray-300 mb-4 text-base">{popupInfo.info}</p>
            <button onClick={closePopupAndResume} className="px-6 py-2 rounded font-bold text-white" style={{backgroundColor: popupInfo.color}}> Continuar </button>
          </div>
        </div>
      )}
    </div>
  );
}