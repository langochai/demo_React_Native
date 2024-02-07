import React, { useState, useRef, useEffect } from "react";
import { View, Text, Button } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [fileName, setFileName] = useState(null);

    const soundObject = useRef(new Audio.Sound());

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);
    const pickFile = async () => {
        try {
            const pickerResult = await DocumentPicker.getDocumentAsync({
                type: "audio/*", // Specify the MIME type for audio files
            });
            if (!pickerResult.cancelled) {
                const uri = pickerResult.assets[0].uri;
                const name = pickerResult.assets[0].name;
                setFileName(name);

                await soundObject.current.unloadAsync(); // Stop any currently playing sound

                await soundObject.current.loadAsync(
                    { uri },
                    { shouldPlay: false }
                );
                setSound(soundObject.current);
            }
        } catch (error) {
            console.log("Error picking file:", error);
        }
    };

    const togglePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await soundObject.current.pauseAsync();
            } else {
                await soundObject.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text>File Name: {fileName}</Text>
            <Button title="Pick File" onPress={pickFile} />
            <Button
                title={isPlaying ? "Pause" : "Play"}
                onPress={togglePlayPause}
                disabled={!sound}
            />
        </View>
    );
}
