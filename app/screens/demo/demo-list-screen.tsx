import React, { useEffect, FC, useRef } from "react"
import {
  StyleSheet,
  Animated,
  FlatList,
  TextStyle,
  View,
  ViewStyle,
  ImageStyle,
  Alert,
} from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { Header, Screen, Text, AutoImage as Image, GradientBackground } from "../../components"
import { color, spacing } from "../../theme"
import { useStores } from "../../models"
import { NavigatorParamList } from "../../navigators"
import Swipeable from "react-native-gesture-handler/Swipeable"
import { RectButton } from "react-native-gesture-handler"
import { palette } from "../../theme/palette"
import { Character } from "../../models/character/character"

const FULL: ViewStyle = {
  flex: 1,
}
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
}
const HEADER: TextStyle = {
  paddingBottom: spacing[5] - 1,
  paddingHorizontal: spacing[4],
  paddingTop: spacing[3],
}
const HEADER_TITLE: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 1.5,
  lineHeight: 15,
  textAlign: "center",
}
const LIST_CONTAINER: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  padding: 10,
  backgroundColor: palette.deepPurple,
}
const IMAGE: ImageStyle = {
  borderRadius: 35,
  height: 65,
  width: 65,
}
const LIST_TEXT: TextStyle = {
  marginLeft: 10,
}
const FLAT_LIST: ViewStyle = {
  paddingHorizontal: spacing[4],
}

const renderLeftActions = (onArchive) => (
  progress: Animated.AnimatedInterpolation,
  dragX: Animated.AnimatedInterpolation,
): React.ReactNode => {
  const trans = dragX.interpolate({
    inputRange: [0, 50, 100, 101],
    outputRange: [-20, 0, 0, 1],
  })

  const swipeProgress = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  })

  return (
    <RectButton
      style={{
        flex: 1,
        height: 80,
        paddingVertical: 30,
        paddingHorizontal: 20,
        justifyContent: "space-between",
        flexDirection: "column",
        backgroundColor: palette.angry,
      }}
      onPress={() => onArchive()}
    >
      <Animated.Text
        style={[
          {
            color: palette.white,
            fontSize: 16,
            fontWeight: "bold",
          },
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        Archive
      </Animated.Text>
    </RectButton>
  )
}

function CharacterRow({ character }: { character: Character }) {
  const { characterStore } = useStores()

  const swipeRef = useRef(undefined)

  const heightAnim = useRef(new Animated.Value(85)).current
  const paddingAnim = useRef(new Animated.Value(10)).current

  const onArchive = () => {
    // animate to zero height
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(paddingAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // delete this item
      characterStore.removeCharacter(character)
    })
  }

  return (
    <Swipeable
      renderLeftActions={renderLeftActions(onArchive)}
      overshootFriction={10}
      onSwipeableLeftOpen={onArchive}
      ref={swipeRef}
    >
      <Animated.View style={[LIST_CONTAINER, { height: heightAnim, paddingVertical: paddingAnim }]}>
        <Image source={{ uri: character.image }} style={IMAGE} />
        <Text style={LIST_TEXT}>
          {character.name} ({character.status})
        </Text>
      </Animated.View>
    </Swipeable>
  )
}

export const DemoListScreen: FC<StackScreenProps<NavigatorParamList, "demoList">> = observer(
  ({ navigation }) => {
    const goBack = () => navigation.goBack()

    const { characterStore } = useStores()
    const { characters } = characterStore

    useEffect(() => {
      async function fetchData() {
        await characterStore.getCharacters()
      }

      fetchData()
    }, [])

    return (
      <View testID="DemoListScreen" style={FULL}>
        <GradientBackground colors={["#422443", "#281b34"]} />
        <Screen style={CONTAINER} preset="fixed" backgroundColor={color.transparent}>
          <Header
            headerTx="demoListScreen.title"
            leftIcon="back"
            onLeftPress={goBack}
            style={HEADER}
            titleStyle={HEADER_TITLE}
          />
          <FlatList
            contentContainerStyle={FLAT_LIST}
            data={[...characters]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <CharacterRow character={item} />}
          />
        </Screen>
      </View>
    )
  },
)
