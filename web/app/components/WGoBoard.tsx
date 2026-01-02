"use client";

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    WGo: any;
    handleNativeMove: (move: {x: number, y: number, color: string}) => void;
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

export default function WGoBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [debugMsg, setDebugMsg] = useState("");
  const [captureCount, setCaptureCount] = useState({ black: 0, white: 0 });
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const wgoInstance = useRef<any>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const gameInstance = useRef<any>(null);

  // Manual Script Injection (Robust for WebView)
  useEffect(() => {
      if (typeof window !== 'undefined' && window.WGo) {
          setLoaded(true);
          return;
      }

      console.log("Injecting WGo script manually...");
      setDebugMsg("Injecting script...");
      
      const script = document.createElement('script');
      script.src = "/wgo/wgo.js"; // This path is relative to public/
      script.async = true;
      script.onload = () => {
          console.log("WGo.js loaded manually");
          setDebugMsg("Script loaded!");
          setLoaded(true);
      };
      script.onerror = (e) => {
          console.error("WGo script load failed", e);
          setDebugMsg("Script FAILED to load");
      };
      document.body.appendChild(script);
      
      return () => {
          // Cleanup if needed
      };
  }, []);

  // Helper: Sync board display with game state
  const syncBoardWithGame = (board: any, game: any) => {
    board.removeAllObjects();
    const position = game.getPosition();
    for (let x = 0; x < 19; x++) {
      for (let y = 0; y < 19; y++) {
        const stone = position.get(x, y);
        if (stone !== 0) {
          board.addObject({ x, y, c: stone });
        }
      }
    }
    setCaptureCount({
      black: game.getCaptureCount(window.WGo.B),
      white: game.getCaptureCount(window.WGo.W)
    });
  };

  const initBoard = () => {
    if (!boardRef.current || !window.WGo) {
        setDebugMsg("Init skipped: No Board Ref or WGo");
        return;
    }
    if (wgoInstance.current) return;

    // Calculate board size based on viewport (mobile-friendly)
    const viewportWidth = Math.min(window.innerWidth, window.innerHeight);
    const boardSize = Math.floor(viewportWidth * 0.9); // 90% of smaller dimension
    setDebugMsg(`Initializing Board (${boardSize}px)`);

    try {
        // Initialize Game logic (with KO rule)
        const game = new window.WGo.Game(19, "KO");
        gameInstance.current = game;

        // Initialize Board display
        const board = new window.WGo.Board(boardRef.current, {
          width: boardSize,
          height: boardSize,
          size: 19,
          background: '#eec085', 
          section: {
            top: -0.5, left: -0.5, right: -0.5, bottom: -0.5
          }
        });

        // Click handler with proper game rules
        board.addEventListener("click", function(x: number, y: number) {
            if(x < 0 || y < 0 || x >= 19 || y >= 19) return;
            
            const currentColor = game.turn; // Game tracks whose turn it is
            const result = game.play(x, y, currentColor);
            
            // result is array of captured stones if valid, or error code if invalid
            if (typeof result === 'number') {
                // Invalid move
                const errors: Record<number, string> = {
                    1: "Out of board",
                    2: "Already occupied",
                    3: "Suicide forbidden",
                    4: "Ko violation"
                };
                setDebugMsg(`Invalid: ${errors[result] || 'Unknown'}`);
                return;
            }
            
            // Valid move - sync board display
            syncBoardWithGame(board, game);
            setDebugMsg(`Played (${x},${y}) - Captured: ${result.length}`);

            // Notify Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'move', 
                   x, 
                   y, 
                   color: currentColor === window.WGo.B ? 'black' : 'white',
                   captured: result.length,
                   captureCount: {
                     black: game.getCaptureCount(window.WGo.B),
                     white: game.getCaptureCount(window.WGo.W)
                   }
                }));
            }
        });

        // Bridge for Native moves
        window.handleNativeMove = (move: {x: number, y: number, color: string}) => {
             const c = (move.color === 'black') ? window.WGo.B : window.WGo.W;
             const result = game.play(move.x, move.y, c);
             if (typeof result !== 'number') {
                 syncBoardWithGame(board, game);
             }
        };

        wgoInstance.current = board;
        setDebugMsg("Board Ready - Black to play");
    } catch (error: unknown) {
        const e = error as Error;
        console.error("Init Error", e);
        setDebugMsg("Init Error: " + e.message);
    }
  };

  useEffect(() => {
      if (loaded) {
          // Double check delay for WebView layout
          setTimeout(initBoard, 200);
      }
  }, [loaded]);

  return (
    <div className="flex flex-col items-center p-4 bg-white min-h-screen w-full">
      <div className="mb-2 text-center">
        <h2 className="text-lg font-bold text-gray-800">WGo WebView</h2>
        <p className="text-xs text-red-500 font-mono">
            Status: {debugMsg}
        </p>
        <div className="flex justify-center gap-4 mt-1 text-sm">
          <span className="text-gray-700">⚫ Captured: {captureCount.black}</span>
          <span className="text-gray-700">⚪ Captured: {captureCount.white}</span>
        </div>
      </div>
      
      {/* Container: Fits board content */}
      <div 
        ref={boardRef} 
        id="wgo-container"
        className="shadow-lg rounded overflow-hidden inline-block"
      />
      
      <div className="mt-4 flex gap-2">
        <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 rounded text-sm"
        >
            Reload Page
        </button>
        <button 
            onClick={() => { setLoaded(true); initBoard(); }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm"
        >
            Retry Init
        </button>
      </div>
    </div>
  );
}