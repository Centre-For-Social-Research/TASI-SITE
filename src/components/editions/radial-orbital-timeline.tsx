"use client";

import { useState, useEffect, useRef } from "react";
import type { ElementType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Lightbulb,
  Link,
  Mic2,
  Orbit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const iconMap = {
  arrival: Building2,
  future: ArrowUpRight,
  keynotes: Mic2,
  takeaways: Lightbulb,
  tracks: Orbit,
} satisfies Record<string, ElementType>;

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: keyof typeof iconMap;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  variant?: "immersive" | "compact";
}

export default function RadialOrbitalTimeline({
  timelineData,
  variant = "immersive",
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isCompact = variant === "compact";

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = isCompact ? 132 : 272;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className={
        isCompact
          ? "flex w-full items-center justify-center rounded-[10px] border border-white/65 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(248,241,232,0.92)_44%,rgba(240,230,220,0.82)_100%)] shadow-[0_24px_70px_rgba(120,92,70,0.12)] backdrop-blur-xl"
          : "w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,216,158,0.16),rgba(92,15,79,0.18)_22%,rgba(53,2,101,0.88)_56%,rgba(21,0,43,1)_100%)]"
      }
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div
        className={
          isCompact
            ? "relative flex w-full items-center justify-center py-12 md:py-14 lg:py-16"
            : "relative w-full max-w-6xl h-full min-h-[56rem] flex items-center justify-center"
        }
      >
        <div
          className={`${isCompact ? "absolute inset-0 flex items-center justify-center" : "absolute w-full h-full"} flex items-center justify-center ${isCompact ? "scale-[0.96] md:scale-100" : ""}`}
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div
            className={`absolute rounded-full animate-pulse flex items-center justify-center z-10 ${isCompact ? "h-16 w-16 bg-[linear-gradient(135deg,#fff6e8_0%,#f5dcb8_26%,#d7a36b_58%,#b87554_100%)] shadow-[0_0_36px_rgba(189,127,66,0.18)]" : "w-24 h-24 bg-[linear-gradient(135deg,#ffd38a_0%,#ff9d3d_24%,#8a1f65_62%,#3b0c63_100%)] shadow-[0_0_60px_rgba(255,157,61,0.28)]"}`}
          >
            <div
              className={`absolute rounded-full animate-ping opacity-70 ${isCompact ? "h-24 w-24 border border-[#d7b48d]/45" : "w-32 h-32 border border-[#ffd38a]/30"}`}
            ></div>
            <div
              className={`absolute rounded-full animate-ping opacity-50 ${isCompact ? "h-32 w-32 border border-white/45" : "w-40 h-40 border border-white/10"}`}
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className={`rounded-full backdrop-blur-md ${isCompact ? "h-8 w-8 bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.3)]" : "w-12 h-12 bg-white/85 shadow-[0_0_24px_rgba(255,255,255,0.28)]"}`}
            ></div>
          </div>

          <div
            className={`absolute rounded-full ${isCompact ? "h-[16rem] w-[16rem] border border-[#d8b592]/65" : "h-[34rem] w-[34rem] border border-[#ffd38a]/16"}`}
          />
          <div
            className={`absolute rounded-full ${isCompact ? "h-[22rem] w-[22rem] border border-[#ead8c3]/85" : "h-[44rem] w-[44rem] border border-white/10"}`}
          />
          <div
            className={`absolute rounded-full ${isCompact ? "h-[28rem] w-[28rem] border border-white/80" : "h-[54rem] w-[54rem] border border-white/6"}`}
          />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = iconMap[item.icon];

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: isCompact
                      ? `radial-gradient(circle, rgba(196,139,85,0.18) 0%, rgba(255,255,255,0) 72%)`
                      : `radial-gradient(circle, rgba(255,211,138,0.2) 0%, rgba(255,255,255,0) 72%)`,
                    width: `${item.energy * 0.34 + (isCompact ? 28 : 40)}px`,
                    height: `${item.energy * 0.34 + (isCompact ? 28 : 40)}px`,
                    left: `-${(item.energy * 0.34 + (isCompact ? 28 : 40) - (isCompact ? 28 : 40)) / 2}px`,
                    top: `-${(item.energy * 0.34 + (isCompact ? 28 : 40) - (isCompact ? 28 : 40)) / 2}px`,
                  }}
                ></div>

                <div
                  className={`
                  rounded-full flex items-center justify-center
                  ${isCompact ? "w-8 h-8" : "w-10 h-10"}
                  ${
                    isExpanded
                      ? isCompact
                        ? "bg-white text-[#5f2b24]"
                        : "bg-[#fff2db] text-[#2f143d]"
                      : isRelated
                        ? isCompact
                          ? "bg-[#f1d8bb] text-[#5f2b24]"
                          : "bg-[#ffd38a]/70 text-[#2f143d]"
                        : isCompact
                          ? "bg-[linear-gradient(135deg,#6b3659_0%,#9a5e56_100%)] text-white"
                          : "bg-[#1a0828] text-white"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? isCompact
                        ? "border-white shadow-lg shadow-[#d8b592]/35"
                        : "border-[#fff2db] shadow-lg shadow-[#ffd38a]/25"
                      : isRelated
                        ? isCompact
                          ? "border-[#c58c55] animate-pulse"
                          : "border-[#ffd38a] animate-pulse"
                        : isCompact
                          ? "border-white/75"
                          : "border-white/30"
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : ""}
                `}
                >
                  <Icon size={isCompact ? 13 : 16} />
                </div>

                <div
                  className={`
                  absolute whitespace-nowrap font-semibold tracking-wider
                  transition-all duration-300
                  ${isCompact ? "top-10 text-[10px]" : "top-12 text-xs"}
                  ${isExpanded ? (isCompact ? "text-[#5f2b24] scale-110" : "text-white scale-125") : isCompact ? "text-[#6d5143]/88" : "text-white/78"}
                `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card
                    className={`absolute left-1/2 -translate-x-1/2 overflow-visible backdrop-blur-lg ${isCompact ? "top-16 w-56 border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,239,229,0.96))] shadow-xl shadow-[#d9c0ab]/35" : "top-24 w-72 border-[#ffd38a]/20 bg-[linear-gradient(180deg,rgba(35,9,50,0.94),rgba(17,4,31,0.96))] shadow-xl shadow-[#12001f]/30"}`}
                  >
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 ${isCompact ? "bg-[#c58c55]/70" : "bg-[#ffd38a]/60"}`}
                    ></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 text-xs ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                              ? "IN PROGRESS"
                              : "PENDING"}
                        </Badge>
                        <span
                          className={`text-xs font-mono ${isCompact ? "text-stone-500" : "text-white/60"}`}
                        >
                          {item.date}
                        </span>
                      </div>
                      <CardTitle
                        className={`text-sm mt-2 ${isCompact ? "text-[#2f1e18]" : "text-white"}`}
                      >
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent
                      className={`text-xs ${isCompact ? "text-stone-700" : "text-white/84"}`}
                    >
                      <p>{item.content}</p>

                      {item.relatedIds.length > 0 && (
                        <div
                          className={`mt-4 pt-3 ${isCompact ? "border-t border-stone-200/90" : "border-t border-white/10"}`}
                        >
                          <div className="flex items-center mb-2">
                            <Link
                              size={10}
                              className={`mr-1 ${isCompact ? "text-[#a66b43]" : "text-[#ffd38a]/80"}`}
                            />
                            <h4
                              className={`text-xs uppercase tracking-wider font-medium ${isCompact ? "text-stone-500" : "text-white/70"}`}
                            >
                              Connected Nodes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className={`flex items-center h-6 px-2 py-0 text-xs rounded-none transition-all ${isCompact ? "border-stone-300 bg-white/55 text-stone-700 hover:bg-white hover:text-stone-900" : "border-[#ffd38a]/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={8}
                                    className="ml-1 text-white/60"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
