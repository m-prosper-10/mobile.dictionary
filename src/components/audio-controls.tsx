import { Audio, type AVPlaybackStatus } from "expo-av";
import { Play, Pause, Square, Volume2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { cn } from "@/utils/tailwind";

type AudioState = "idle" | "loading" | "playing" | "paused" | "stopped" | "error";

type AudioControlsProps = {
  audioUrls: string[];
};

export function AudioControls({ audioUrls }: AudioControlsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const playbackTokenRef = useRef(0);

  const hasAudio = audioUrls.length > 0;
  const selectedAudioUrl = useMemo(
    () =>
      hasAudio
        ? audioUrls[Math.min(selectedIndex, audioUrls.length - 1)]
        : null,
    [audioUrls, hasAudio, selectedIndex],
  );

  useEffect(() => {
    if (selectedIndex >= audioUrls.length) {
      setSelectedIndex(0);
    }
  }, [audioUrls.length, selectedIndex]);

  const unloadAudio = useCallback(async (sound: Audio.Sound | null = soundRef.current) => {
    if (!sound) {
      return;
    }

    if (soundRef.current === sound) {
      soundRef.current = null;
    }

    try {
      await sound.unloadAsync();
    } catch {
      // Ignore unload failures during cleanup.
    }
  }, []);

  useEffect(() => {
    const token = ++playbackTokenRef.current;
    const previousSound = soundRef.current;

    void unloadAudio(previousSound).finally(() => {
      if (token === playbackTokenRef.current) {
        setAudioState("idle");
        setError(null);
      }
    });

    return () => {
      playbackTokenRef.current += 1;
    };
  }, [selectedAudioUrl, unloadAudio]);

  useEffect(() => {
    return () => {
      const token = ++playbackTokenRef.current;
      void unloadAudio().finally(() => {
        if (token === playbackTokenRef.current) {
          setAudioState("idle");
        }
      });
    };
  }, [unloadAudio]);

  const handlePlaybackStatusUpdate = useCallback(
    (token: number) => (status: AVPlaybackStatus) => {
      if (token !== playbackTokenRef.current) {
        return;
      }

      if (!status.isLoaded) {
        soundRef.current = null;
        setAudioState("error");
        setError(status.error ?? "Unable to load pronunciation audio.");
        return;
      }

      if (status.didJustFinish) {
        setAudioState("stopped");
        return;
      }

      if (status.isBuffering) {
        setAudioState("loading");
        return;
      }

      if (status.isPlaying) {
        setAudioState("playing");
        return;
      }

      if (status.positionMillis === 0) {
        setAudioState("stopped");
      }
    },
    [],
  );

  const makeSoundCurrent = useCallback((sound: Audio.Sound) => {
    sound.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate(playbackTokenRef.current));
    soundRef.current = sound;
  }, [handlePlaybackStatusUpdate]);

  const resetState = useCallback(() => {
    setAudioState("idle");
    setError(null);
  }, []);

  async function loadAudio() {
    if (!selectedAudioUrl) {
      setAudioState("error");
      setError("No pronunciation audio available.");
      return null;
    }

    const token = playbackTokenRef.current;

    try {
      setAudioState("loading");
      setError(null);
      const previousSound = soundRef.current;
      await unloadAudio(previousSound);

      if (token !== playbackTokenRef.current) {
        return null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedAudioUrl },
        { shouldPlay: false },
      );

      if (token !== playbackTokenRef.current) {
        await unloadAudio(sound);
        return null;
      }

      makeSoundCurrent(sound);
      setAudioState("stopped");
      return sound;
    } catch {
      setAudioState("error");
      setError("Unable to load pronunciation audio.");
      return null;
    }
  }

  async function handlePlay() {
    try {
      if (audioState === "loading" || audioState === "playing") {
        return;
      }

      const token = playbackTokenRef.current;
      const activeSound = soundRef.current ?? (await loadAudio());
      if (!activeSound) {
        return;
      }

      if (token !== playbackTokenRef.current) {
        return;
      }

      await activeSound.playAsync();
    } catch {
      setAudioState("error");
      setError("Unable to play pronunciation audio.");
    }
  }

  async function handlePause() {
    if (audioState !== "playing") {
      return;
    }

    const sound = soundRef.current;
    if (!sound) {
      return;
    }

    try {
      await sound.pauseAsync();
      setAudioState("paused");
    } catch {
      setAudioState("error");
      setError("Unable to pause pronunciation audio.");
    }
  }

  async function handleStop() {
    if (!["playing", "paused", "stopped"].includes(audioState)) {
      return;
    }

    const sound = soundRef.current;
    if (!sound) {
      return;
    }

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setAudioState("stopped");
    } catch {
      setAudioState("error");
      setError("Unable to stop pronunciation audio.");
    }
  }

  if (!hasAudio) {
    return (
      <Text className="text-[13px] text-muted-foreground">
        No pronunciation audio available.
      </Text>
    );
  }

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-center gap-2">
        <Pressable
          onPress={handlePlay}
          disabled={audioState === "loading"}
          className="flex-row items-center gap-2 rounded-lg border border-border bg-foreground px-3 py-2 active:opacity-80 disabled:opacity-50"
        >
          <Icon icon={audioState === "playing" ? Volume2 : Play} className="w-4 h-4 text-background" />
          <Text className="text-[14px] font-semibold text-background">
            {audioState === "loading" ? "Loading" : "Play"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handlePause}
          disabled={audioState !== "playing"}
          className={cn(
            "flex-row items-center gap-2 rounded-lg border border-border px-3 py-2 active:bg-muted disabled:opacity-50",
            audioState !== "playing" && "opacity-50",
          )}
        >
          <Icon icon={Pause} className="w-4 h-4 text-foreground" />
          <Text className="text-[14px] font-medium text-foreground">Pause</Text>
        </Pressable>

        <Pressable
          onPress={handleStop}
          disabled={!["playing", "paused", "stopped"].includes(audioState)}
          className={cn(
            "flex-row items-center gap-2 rounded-lg border border-border px-3 py-2 active:bg-muted disabled:opacity-50",
            !["playing", "paused", "stopped"].includes(audioState) && "opacity-50",
          )}
        >
          <Icon icon={Square} className="w-4 h-4 text-foreground" />
          <Text className="text-[14px] font-medium text-foreground">Stop</Text>
        </Pressable>
      </View>

      {audioUrls.length > 1 && (
        <View className="gap-2">
          <Text className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pronunciation
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {audioUrls.map((_, index) => {
              const isActive = index === selectedIndex;
              return (
                <Pressable
                  key={`${index}-${audioUrls[index]}`}
                  onPress={() => {
                    if (index === selectedIndex) {
                      return;
                    }

                    playbackTokenRef.current += 1;
                    setSelectedIndex(index);
                    resetState();
                  }}
                  className={cn(
                    "h-8 min-w-8 items-center justify-center rounded-lg border px-2 active:bg-muted",
                    isActive
                      ? "border-foreground bg-foreground"
                      : "border-border bg-card",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[13px] font-medium",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {error ? (
        <Text selectable className="text-[13px] text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
