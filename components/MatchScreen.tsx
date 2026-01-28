
import React from 'react';
import { MatchSettings, MatchState, CompletedMatch } from '../types';
import { handlePoint, handleSideOut, undoState, handleManualSwapPlayers, handleManualSwapSides } from '../logic';
import { ArrowLeft, RotateCcw, AlertTriangle, ChevronRight, CheckCircle2, Repeat, UserRoundPen } from 'lucide-react';

interface Props {
  settings: MatchSettings;
  state: MatchState;
  setState: React.Dispatch<React.SetStateAction<MatchState>>;
  onExit: () => void;
  onFinish: (match: CompletedMatch) => void;
}

const MatchScreen: React.FC<Props> = ({ settings, state, setState, onExit, onFinish }) => {
  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('pickleball_current_state', JSON.stringify(state));
      console.log('Match state saved:', state.scores, 'Serving:', state.servingTeam);
    } catch (e) {
      console.error('Failed to save match state:', e);
    }
  }, [state]);

  const { scores, servingTeam, serverNumber, teamPositions, isGameOver, visualSideSwapped } = state;

  const onPoint = (teamIdx: 0 | 1) => {
    if (isGameOver || servingTeam !== teamIdx) return;
    setState(prev => handlePoint(prev, teamIdx, settings));
  };

  const onSideOut = () => {
    if (isGameOver) return;
    setState(prev => handleSideOut(prev));
  };

  const onUndo = () => {
    setState(prev => undoState(prev));
  };

  const onManualSwapPlayers = (teamIdx: 0 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => handleManualSwapPlayers(prev, teamIdx));
  };

  const onManualSwapSides = () => {
    setState(prev => handleManualSwapSides(prev));
  };

  const handleFinish = () => {
    const completedMatch: CompletedMatch = {
      id: Date.now().toString(),
      teams: settings.teams,
      scores: scores,
      winningPoint: settings.winningPoint,
      groupName: settings.groupName,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
    };
    onFinish(completedMatch);
  };

  const baseParityIdx = scores[servingTeam] % 2 === 0 ? 0 : 1;
  const activeServerSideIdx = (serverNumber === 1) ? baseParityIdx : (1 - baseParityIdx);
  const activeReceiverSideIdx = activeServerSideIdx;
  const receivingTeam = 1 - servingTeam;

  const renderSide = (teamIdx: 0 | 1) => {
    const isServing = servingTeam === teamIdx;
    const isReceiving = receivingTeam === teamIdx;
    const isVisualLeft = (teamIdx === 0 && !visualSideSwapped) || (teamIdx === 1 && visualSideSwapped);
    const areaIndices = isVisualLeft ? [1, 0] : [0, 1];

    return (
      <div 
        className={`relative flex-1 flex transition-all duration-500 ${isServing ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] grayscale-[0.2]'} ${isVisualLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <div className={`flex-1 flex flex-col gap-1 ${isVisualLeft ? 'pr-1' : 'pl-1'} bg-[#0f172a]`}>
          {areaIndices.map((areaIdx) => {
            const isServer = isServing && activeServerSideIdx === areaIdx;
            const isReceiver = isReceiving && activeReceiverSideIdx === areaIdx;
            
            return (
              <div key={areaIdx} className={`flex-1 flex flex-col items-center justify-center relative transition-colors duration-300 ${isServer ? 'bg-blue-500 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]' : 'bg-blue-700/80'}`}>
                <div className="text-center px-2">
                  <div className="text-[11px] font-black truncate max-w-[140px] mb-1 leading-tight uppercase text-white/90">{settings.teams[teamIdx].players[teamPositions[teamIdx][areaIdx]].name}</div>
                  {isServer && <div className="text-[9px] font-black bg-yellow-400 text-black px-2 py-0.5 rounded shadow-lg tracking-tighter uppercase border border-yellow-200">GIAO BÓNG</div>}
                  {isReceiver && <div className="text-[9px] font-black bg-white text-black px-2 py-0.5 rounded shadow-lg tracking-tighter uppercase border border-slate-200">ĐỠ BÓNG</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div className={`w-1/3 bg-green-600 flex items-center justify-center ${isVisualLeft ? 'border-l' : 'border-r'} border-white/20`}>
          <span className={`${isVisualLeft ? 'rotate-90' : '-rotate-90'} text-[10px] font-black tracking-widest text-white/30 uppercase`}>KITCHEN</span>
        </div>
        <button 
          onClick={(e) => onManualSwapPlayers(teamIdx, e)}
          className={`absolute bottom-3 ${isVisualLeft ? 'left-3' : 'right-3'} p-2.5 bg-slate-950/90 rounded-full border border-white/20 text-slate-400 active:scale-90 active:bg-blue-600 active:text-white transition-all z-20 shadow-2xl`}
        >
          <UserRoundPen size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#05070a] text-white overflow-hidden safe-area-padding">
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-slate-900 border-b border-white/5 z-50">
        <button onClick={onExit} className="p-2 text-slate-400 active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
            {settings.groupName ? `${settings.groupName} • ` : ''}CHẠM {settings.winningPoint}
          </span>
          <span className="text-[9px] text-slate-600 font-bold uppercase italic">COCO PICK REFEREE</span>
        </div>
        <button onClick={onUndo} className="p-2 text-slate-400 active:rotate-[-45deg] transition-transform">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-0">
        <div className="w-full h-full max-w-[1200px] mx-auto flex flex-col items-center justify-center relative min-h-0">
          <div className="w-full aspect-[16/9] max-h-full flex rounded-[2rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] border-4 border-white/10 bg-slate-900/50 relative">
            {!visualSideSwapped ? renderSide(0) : renderSide(1)}
            <div className="w-3 bg-white relative z-20 shadow-[0_0_40px_rgba(255,255,255,0.4)]">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-black/30 h-full"></div>
            </div>
            {!visualSideSwapped ? renderSide(1) : renderSide(0)}

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <div className="bg-[#0f172a]/95 backdrop-blur-3xl px-8 py-4 rounded-[3.5rem] border-2 border-white/10 shadow-[0_40px_80px_rgba(0,0,0,1)] flex items-center gap-10 sm:gap-14">
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest mb-1 ${servingTeam === (!visualSideSwapped ? 0 : 1) ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {settings.teams[!visualSideSwapped ? 0 : 1].name}
                  </span>
                  <span className="text-6xl sm:text-8xl font-black text-white leading-none tabular-nums drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">{scores[!visualSideSwapped ? 0 : 1]}</span>
                </div>
                <div className="w-[2px] h-12 sm:h-16 bg-white/10 rounded-full"></div>
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest mb-1 ${servingTeam === (!visualSideSwapped ? 1 : 0) ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {settings.teams[!visualSideSwapped ? 1 : 0].name}
                  </span>
                  <span className="text-6xl sm:text-8xl font-black text-white leading-none tabular-nums drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">{scores[!visualSideSwapped ? 1 : 0]}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 z-40">
             <div className="bg-blue-600 text-white px-8 py-2 sm:py-3 rounded-2xl font-black shadow-[0_25px_60px_rgba(37,99,235,0.5)] border-b-8 border-blue-800 flex items-center justify-center transition-transform active:scale-95">
                <span className="text-lg sm:text-xl font-black uppercase tracking-widest">LƯỢT PHÁT {serverNumber}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 space-y-4 pb-20 sm:pb-14 shrink-0">
        <div className={`grid grid-cols-4 gap-3 ${visualSideSwapped ? 'flex-row-reverse' : ''}`}>
          {/* Nút Đội A: Chỉ cho phép nhấn khi đang giao bóng */}
          <button 
            onClick={() => onPoint(visualSideSwapped ? 1 : 0)}
            disabled={servingTeam !== (visualSideSwapped ? 1 : 0)}
            className={`col-span-1 border transition-all py-6 sm:py-8 rounded-2xl flex flex-col items-center justify-center font-bold text-sm ${servingTeam === (visualSideSwapped ? 1 : 0) ? 'bg-blue-600/40 border-blue-500 text-blue-300 active:scale-95' : 'bg-white/5 border-white/5 text-slate-700 opacity-50 pointer-events-none'}`}
          >
            <span className="uppercase text-[9px] tracking-widest opacity-60 mb-1">{settings.teams[visualSideSwapped ? 1 : 0].name}</span>
            <span className="font-black text-xs sm:text-sm">+ ĐIỂM</span>
          </button>

          <button 
            onClick={onSideOut}
            className="col-span-2 bg-red-600 hover:bg-red-500 active:scale-95 py-6 sm:py-8 rounded-2xl flex flex-col items-center justify-center font-black text-xl sm:text-2xl shadow-2xl transition-all border-b-8 border-red-900"
          >
            {serverNumber === 1 ? 'LỖI (SANG S2)' : 'ĐỔI GIAO'}
          </button>

          {/* Nút Đội B: Chỉ cho phép nhấn khi đang giao bóng */}
          <button 
            onClick={() => onPoint(visualSideSwapped ? 0 : 1)}
            disabled={servingTeam !== (visualSideSwapped ? 0 : 1)}
            className={`col-span-1 border transition-all py-6 sm:py-8 rounded-2xl flex flex-col items-center justify-center font-bold text-sm ${servingTeam === (visualSideSwapped ? 0 : 1) ? 'bg-green-600/40 border-green-500 text-green-300 active:scale-95' : 'bg-white/5 border-white/5 text-slate-700 opacity-50 pointer-events-none'}`}
          >
            <span className="uppercase text-[9px] tracking-widest opacity-60 mb-1">{settings.teams[visualSideSwapped ? 0 : 1].name}</span>
            <span className="font-black text-xs sm:text-sm">+ ĐIỂM</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={onManualSwapSides}
            className="bg-slate-800/80 hover:bg-slate-700 py-3 sm:py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] sm:text-[12px] font-black text-blue-400 uppercase tracking-widest transition-colors border border-white/10 shadow-lg active:scale-95"
          >
            <Repeat size={16} /> ĐỔI SÂN
          </button>
          <button 
            onClick={onUndo}
            className="bg-red-600 hover:bg-red-500 py-3 sm:py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] sm:text-[12px] font-black text-white uppercase tracking-widest transition-colors border border-white/10 shadow-lg active:scale-95"
          >
            <RotateCcw size={16} /> HOÀN TÁC
          </button>
          <button onClick={() => {}} className="bg-slate-800/80 hover:bg-slate-700 py-3 sm:py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] sm:text-[12px] font-black text-yellow-500 uppercase tracking-widest transition-colors border border-white/10 shadow-lg active:scale-95">
            <AlertTriangle size={16} /> LỖI
          </button>
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 bg-slate-950/99 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-green-500 rounded-full flex items-center justify-center mb-8 sm:mb-12 shadow-[0_0_100px_rgba(34,197,94,0.6)] border-4 border-white/30">
            <CheckCircle2 size={50} className="text-white sm:w-18 sm:h-18" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter">KẾT THÚC</h2>
          <p className="text-xl sm:text-2xl text-green-400 font-black mb-8 sm:mb-14 uppercase tracking-[0.4em]">
            {scores[0] > scores[1] ? settings.teams[0].name : settings.teams[1].name} CHIẾN THẮNG!
          </p>
          <div className="text-[6rem] sm:text-[10rem] font-black text-white mb-10 sm:mb-20 flex items-center gap-8 sm:gap-14 bg-white/5 px-12 sm:px-24 py-6 sm:py-12 rounded-[3rem] sm:rounded-[5rem] border-2 border-white/10 shadow-inner">
            <span className="tabular-nums drop-shadow-2xl">{scores[0]}</span>
            <span className="text-slate-800 text-4xl sm:text-6xl font-black">-</span>
            <span className="tabular-nums drop-shadow-2xl">{scores[1]}</span>
          </div>
          <button 
            onClick={handleFinish}
            className="w-full max-sm bg-white text-black font-black py-5 sm:py-7 rounded-[3rem] flex items-center justify-center gap-5 active:scale-95 transition-transform uppercase tracking-[0.3em] text-xl sm:text-2xl shadow-[0_20px_60px_rgba(255,255,255,0.2)]"
          >
            HOÀN TẤT <ChevronRight size={30} strokeWidth={5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchScreen;
