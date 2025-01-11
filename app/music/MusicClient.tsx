"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Instagram, Music2, Play, Pause, SkipBack, SkipForward, Link, Award } from 'lucide-react';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { ExplosionSystem } from './ExplosionSystem';
import { SoundCloudPlayer } from './SoundCloudPlayer';
import { Spaceship } from './Spaceship';

interface AudioPlayerProps {
  currentTrack: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ScoreboardProps {
  score: number;
  highScore: number;
}

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dotRef.current && targetRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
        
        const targetX = e.clientX - 16;
        const targetY = e.clientY - 16;
        targetRef.current.style.left = `${targetX}px`;
        targetRef.current.style.top = `${targetY}px`;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (targetRef.current) {
        targetRef.current.classList.add('clicking');
      }
      if (beamRef.current) {
        const beam = beamRef.current;
        beam.style.left = `${e.clientX}px`;
        beam.style.top = '0';
        beam.style.height = `${e.clientY}px`;
        beam.style.opacity = '0.5';
        setTimeout(() => {
          beam.style.opacity = '0';
        }, 150);
      }
    };

    const handleMouseUp = () => {
      if (targetRef.current) {
        targetRef.current.classList.remove('clicking');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={targetRef} className="cursor-target" />
      <div ref={beamRef} className="beam" style={{ width: '2px' }} />
    </>
  );
};

const SocialLinks = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      url: 'https://www.instagram.com/tzynski/',
      icon: <Instagram className="w-6 h-6" />,
      label: 'Instagram'
    },
    {
      url: 'https://soundcloud.com/i-am_t_is_me',
      icon: <Music2 className="w-6 h-6" />,
      label: 'SoundCloud'
    }
  ];

  return (
    <div className="fixed bottom-24 right-8 flex flex-col items-end gap-4 z-50">
      {isOpen && (
        <div className="flex flex-col gap-4 mb-4 items-center animate-fade-in">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gradient-to-r from-black/80 to-black/40 rounded-full hover:scale-110 transition-all duration-300 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50"
            >
              {link.icon}
            </a>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-r from-black/80 to-black/40 rounded-full hover:scale-110 transition-all duration-300 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 hover:rotate-180"
      >
        <Link className="w-6 h-6" />
      </button>
    </div>
  );
};

const Scoreboard = ({ score, highScore }: ScoreboardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScored, setHasScored] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (score > 0) {
      setHasScored(true);
      setTimeout(() => setHasScored(false), 300);
    }
  }, [score]);

  return (
    <div 
      className={`fixed top-6 left-6 bg-gradient-to-r from-black/90 to-black/70 backdrop-blur-xl 
        border border-cyan-500/20 rounded-2xl p-4 transition-all duration-500 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        ${hasScored ? 'scale-105' : 'scale-100'}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-lg">
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-cyan-400/60 font-medium">CURRENT SCORE</span>
            <span className="font-mono text-xl font-bold text-cyan-300">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-lg">
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-cyan-400/60 font-medium">HIGH SCORE</span>
            <span className="font-mono text-xl font-bold text-cyan-300">
              {highScore.toString().padStart(6, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = ({ currentTrack, isPlaying, onPlayPause, onNext, onPrev }: AudioPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return (
      <div className="fixed bottom-0 w-full bg-black/20 backdrop-blur-xl border-t border-cyan-500/20 p-4">
        <div className="max-w-4xl mx-auto h-12" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent backdrop-blur-xl border-t border-cyan-500/20 p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-6">
        <div className="flex gap-3">
          <button 
            className="p-3 hover:bg-cyan-500/10 rounded-full transition-all duration-300"
            onClick={onPrev}
          >
            <SkipBack className="w-5 h-5 text-cyan-400" />
          </button>
          <button 
            className="p-3 hover:bg-cyan-500/10 rounded-full transition-all duration-300"
            onClick={onPlayPause}
          >
            {isPlaying ? 
              <Pause className="w-5 h-5 text-cyan-400" /> : 
              <Play className="w-5 h-5 text-cyan-400" />
            }
          </button>
          <button 
            className="p-3 hover:bg-cyan-500/10 rounded-full transition-all duration-300"
            onClick={onNext}
          >
            <SkipForward className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
        
        <div className="flex-1 relative h-14 flex items-center overflow-hidden rounded-lg bg-cyan-950/20">
          <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-2">
            {[...Array(40)].map((_, i) => {
              const height = Math.floor((25 + Math.sin(i * 0.8 + progress * 0.1) * 15) * 10) / 10;
              return (
                <div
                  key={i}
                  className="w-[3px] bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
                  style={{ 
                    height: `${height}px`,
                    opacity: (i < (progress / 100) * 40 ? 0.9 : 0.3)
                  }}
                />
              );
            })}
          </div>
          
          <div className="relative z-10 w-full text-center">
            <div className="text-cyan-300 font-mono tracking-wider animate-pulse">
              {currentTrack}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const MusicClient = () => {
    const spaceshipsRef = useRef<Spaceship[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState("Initializing...");
    const [isPlaying, setIsPlaying] = useState(true);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const soundCloudRef = useRef<SoundCloudPlayer | null>(null);
    const explosionSystemsRef = useRef<ExplosionSystem[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);
  
    useEffect(() => {
      const saved = localStorage.getItem('highScore');
      setHighScore(saved ? parseInt(saved) : 0);
  
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.03);
  
      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 15;
  
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
  
      // Lighting
      const ambientLight = new THREE.AmbientLight(0x111111);
      scene.add(ambientLight);
  
      const frontLight = new THREE.DirectionalLight(0x00ffcc, 2);
      frontLight.position.set(0, 0, 10);
      scene.add(frontLight);
  
      const backLight = new THREE.DirectionalLight(0x00ccff, 2);
      backLight.position.set(0, 0, -10);
      scene.add(backLight);
  
      // Dynamic spotlights
      const spotlight1 = new THREE.SpotLight(0x00ffcc, 2);
      spotlight1.angle = 0.4;
      spotlight1.penumbra = 0.3;
      spotlight1.decay = 1.5;
      spotlight1.distance = 40;
  
      const spotlight2 = new THREE.SpotLight(0x00ccff, 2);
      spotlight2.angle = 0.4;
      spotlight2.penumbra = 0.3;
      spotlight2.decay = 1.5;
      spotlight2.distance = 40;
  
      scene.add(spotlight1, spotlight2);
  
      // Create spaceships
      for (let i = 0; i < 5; i++) {
        const spaceship = new Spaceship(scene);
        spaceshipsRef.current.push(spaceship);
      }
  
      // Text setup
      const textGroup = new THREE.Group();
      scene.add(textGroup);
      const loader = new FontLoader();
      
      loader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
        const letters = "TZYNSKI".split("");
        
        const textMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x00ffcc,
          emissive: 0x00ffcc,
          emissiveIntensity: 0.3,
          metalness: 0.7,
          roughness: 0.3,
          clearcoat: 0.5,
          clearcoatRoughness: 0.2,
          transmission: 0.1,
        thickness: 0.5,
        reflectivity: 0.7,
        envMapIntensity: 0.8
      });
      
      letters.forEach((letter, index) => {
        const textGeometry = new TextGeometry(letter, {
          font: font,
          size: 2.5,
          height: 0.8,
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.2,
          bevelSize: 0.05,
          bevelOffset: 0,
          bevelSegments: 16
        });

        textGeometry.center();
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        const xPos = index * 2.5 - (letters.length * 2.5) / 2;
        textMesh.position.set(xPos, 0, 0);
        textGroup.add(textMesh);

        // Create explosion system for each letter
        const explosionSystem = new ExplosionSystem(scene, textMesh);
        explosionSystemsRef.current.push(explosionSystem);
      });
    });

    // Raycaster for shooting mechanics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      // Check text intersections first
      const textIntersects = raycaster.intersectObjects(textGroup.children);
      if (textIntersects.length > 0 && textIntersects[0].object instanceof THREE.Mesh) {
        const index = textGroup.children.indexOf(textIntersects[0].object);
        if (index !== -1) {
          explosionSystemsRef.current[index].explode(textIntersects[0].object.position.clone());
          setScore(prev => {
            const newScore = prev + 10;
            updateHighScore(newScore);
            return newScore;
          });
        }
        return;
      }

      // Get all meshes from all spaceships for intersection testing
      const allUfoMeshes: THREE.Object3D[] = [];
      spaceshipsRef.current.forEach(ship => {
        ship.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            allUfoMeshes.push(child);
          }
        });
      });

      // Check UFO intersections
      const ufoIntersects = raycaster.intersectObjects(allUfoMeshes);
      
      if (ufoIntersects.length > 0) {
        let hitObject = ufoIntersects[0].object;
        while (hitObject.parent && !(hitObject instanceof THREE.Group)) {
          hitObject = hitObject.parent;
        }
        
        const intersectedShip = spaceshipsRef.current.find(
          ship => ship.mesh === hitObject
        );
        
        if (intersectedShip && !intersectedShip.isExploding) {
          intersectedShip.explode();
          setScore(prev => {
            const newScore = prev + 100;
            updateHighScore(newScore);
            return newScore;
          });
        }
      }
    };

    window.addEventListener('click', handleClick);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Animate spotlights
      spotlight1.position.x = Math.sin(elapsedTime * 0.7) * 15;
      spotlight1.position.z = Math.cos(elapsedTime * 0.5) * 15;
      spotlight2.position.x = -Math.sin(elapsedTime * 0.5) * 15;
      spotlight2.position.z = -Math.cos(elapsedTime * 0.7) * 15;

      // Update explosion systems
      explosionSystemsRef.current.forEach(system => system.update());

      // Animate letters
      if (textGroup.children.length > 0) {
        textGroup.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh && child.visible) {
            const time = elapsedTime * 1.5;
            child.position.y = Math.sin(time + index * 0.5) * 0.3;
            child.rotation.x = Math.sin(time + index * 0.3) * 0.1;
            child.rotation.z = Math.cos(time + index * 0.4) * 0.1;
          }
        });
      }

      // Update spaceships
      spaceshipsRef.current.forEach(spaceship => {
        spaceship.update();
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Initialize SoundCloud player
    if (iframeRef.current) {
      soundCloudRef.current = new SoundCloudPlayer(iframeRef.current, (title) => {
        setCurrentTrack(title);
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('click', handleClick);
      renderer.dispose();
      explosionSystemsRef.current.forEach(system => system.dispose());
      spaceshipsRef.current.forEach(ship => ship.dispose());
    };
  }, []);

  const updateHighScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('highScore', newScore.toString());
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      soundCloudRef.current?.pause();
    } else {
      soundCloudRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          overflow: hidden;
          background: black;
          cursor: none;
        }
        .soundcloud-player {
          position: absolute;
          visibility: hidden;
          width: 0;
          height: 0;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .cursor-dot {
          width: 4px;
          height: 4px;
          background: cyan;
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
        }
        .cursor-target {
          width: 32px;
          height: 32px;
          border: 2px solid cyan;
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.15s ease-out;
        }
        .cursor-target.clicking {
          transform: scale(0.8);
        }
        .beam {
          position: fixed;
          background: cyan;
          opacity: 0;
          transition: opacity 0.15s ease-out;
          pointer-events: none;
          z-index: 9998;
        }
      `}</style>
      <CustomCursor />
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />
      <Scoreboard score={score} highScore={highScore} />
      <SocialLinks />
      <AudioPlayer 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={() => soundCloudRef.current?.next()}
        onPrev={() => soundCloudRef.current?.previous()}
      />
      
      <iframe
        ref={iframeRef}
        className="soundcloud-player"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1944939423&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
        allow="autoplay"
      />
    </>
  );
};

export default MusicClient;