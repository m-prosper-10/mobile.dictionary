import { Audio } from "expo-av";
import { Play, Pause, Square, Volume2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const hasAudio = audioUrls.length > 0;
  const selectedAudioUrl = useMemo(
    () => (hasAudio ? audioUrls[Math.min(selectedIndex, audioUrls.length - 1)] : null),
    [audioUrls, hasAudio, selectedIndex],
  );

  useEffect(() => {
    if (selectedIndex >= audioUrls.length) {
      setSelectedIndex(0);
    }
  }, [audioUrls.length, selectedIndex]);

  useEffect(() => {
    void unloadAudio();
    setAudioState("idle");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAudioUrl]);

  useEffect(() => {
    return () => {
      void unloadAudio();
    };
  }, []);

  async function unloadAudio() {
    const sound = soundRef.current;
    soundRef.current = null;

    if (!sound) {
      return;
    }

    try {
      await sound.unloadAsync();
    } catch {
      // Ignore unload failures during cleanup.
    }
  }

  async function loadAudio() {
    if (!selectedAudioUrl) {
      setAudioState("error");
      setError("No pronunciation audio available.");
      return null;
    }

    try {
      setAudioState("loading");
      setError(null);
      await unloadAudio();

      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedAudioUrl },
        { shouldPlay: false },
      );

      soundRef.current = sound;
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
      const activeSound = soundRef.current ?? (await loadAudio());
      if (!activeSound) {
        return;
      }

      await activeSound.playAsync();
      setAudioState("playing");
    } catch {
      setAudioState("error");
      setError("Unable to play pronunciation audio.");
    }
  }

  async function handlePause() {
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
                  onPress={() => setSelectedIndex(index)}
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

      <Text className="text-[12px] text-muted-foreground">
        State: {audioState}
      </Text>

      {error ? (
        <Text selectable className="text-[13px] text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
