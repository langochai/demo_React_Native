import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Button,
    FlatList,
    Alert,
    SafeAreaView,
} from "react-native";
import { StorageAccessFramework } from "expo-file-system";
import { Audio } from "expo-av";
import { LogBox } from "react-native";

export default function App() {
    LogBox.ignoreAllLogs();
    const [musicFiles, setMusicFiles] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const soundObject = useRef(new Audio.Sound());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadAudio = async () => {
            try {
                if (currentSong) {
                    soundObject.current.unloadAsync();
                    await soundObject.current.loadAsync({ uri: currentSong });
                    setIsLoaded(true);
                    if (isPlaying) await soundObject.current.playAsync();
                }
            } catch (error) {
                console.log("Error loading audio:", error);
                Alert.alert(
                    "Error",
                    "An error occurred while loading the audio file."
                );
            }
        };

        loadAudio();

        return () => {
            if (isLoaded) {
                soundObject.current.stopAsync();
                soundObject.current.unloadAsync();
            }
        };
    }, [currentSong]);

    const loadMusicFiles = async () => {
        try {
            const permissions =
                await StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
                const uri = permissions.directoryUri;
                const files = await StorageAccessFramework.readDirectoryAsync(
                    uri
                );

                const musicFiles = files.filter(
                    (fileName) =>
                        fileName.endsWith(".mp3") || fileName.endsWith(".m4a")
                );
                setMusicFiles(musicFiles);
                setIsPlaying(false); // Revert play/pause button to "play"
            } else {
                Alert.alert(
                    "Permission Denied",
                    "Please grant permission to access files."
                );
            }
        } catch (error) {
            console.log("Error loading music files:", error);
            Alert.alert(
                "Error",
                "An error occurred while loading music files."
            );
        }
    };

    const togglePlayPause = async () => {
        try {
            if (isLoaded) {
                if (isPlaying) await soundObject.current.pauseAsync();
                else await soundObject.current.playAsync();
                setIsPlaying(!isPlaying);
            }
        } catch (error) {
            console.log("Error toggling play/pause:", error);
            Alert.alert(
                "Error",
                "An error occurred while toggling play/pause."
            );
        }
    };

    const playMusicFile = async (fileName) => {
        try {
            setCurrentSong(fileName);
            setIsPlaying(true);
        } catch (error) {
            console.log("Error playing music file:", error);
            Alert.alert(
                "Error",
                "An error occurred while playing the music file."
            );
        }
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: "2"
            }}
        >
            <Text>Music Files:</Text>
            <FlatList
                data={musicFiles}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Text>{extractFileName(item)}</Text>
                        <Button
                            title={
                                item === currentSong && isPlaying
                                    ? "Pause"
                                    : "Play"
                            }
                            onPress={() => {
                                if (item === currentSong) togglePlayPause();
                                else playMusicFile(item);
                            }}
                        />
                    </View>
                )}
            />
            <Button title="Choose Folder" onPress={loadMusicFiles} />
        </View>
    );
}

const extractFileName = (uri) => {
    const decodedUri = decodeURIComponent(uri);
    const parts = decodedUri.split("/");
    const encodedFileName = parts[parts.length - 1];
    const decodedFileName = decodeURIComponent(encodedFileName);
    return decodedFileName;
};
