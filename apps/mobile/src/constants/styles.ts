// styles.ts
import { StyleSheet } from "react-native";

export const fontSizeStyles = StyleSheet.create({
  small: { fontSize: 16 * 0.95 },
  medium: { fontSize: 16 * 1.15 },
  large: { fontSize: 16 * 1.35 },
});

export const highContrastStyles = StyleSheet.create({
  text: { color: "#000000" },
  background: { backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#000000" },
  border: { borderColor: "#000000", borderWidth: 2 },
  grayText: { color: "#000000" },
  grayBg: { backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#000000" },
  borderGray: { borderColor: "#000000", borderWidth: 2 },
});

export const navbarStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: 66,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2000,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    paddingHorizontal: 16,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 90,
    gap: 14,
  },
  navIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  navCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navLogo: { height: 46, resizeMode: "contain" },
  navRight: { flexDirection: "row", alignItems: "center" },
});

export const slideMenuStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 270,
    backgroundColor: "#fff",
    shadowColor: "#282828",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    zIndex: 3000,
    flexDirection: "column",
    paddingTop: 66,
  },
  menuList: { margin: 0, padding: 0 },
  menuItem: {
    fontSize: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    color: "#222",
    backgroundColor: "#fff",
  },
  selectedItem: {
    backgroundColor: "#0458a3",
    color: "#fff",
    fontWeight: "600",
  },
  lastItem: { borderBottomWidth: 0 },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  closeBtnHover: { backgroundColor: "#f0f0f0" },
});

export const accessibilityStyles = StyleSheet.create({
  focusOutline: {
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: "hidden",
    borderWidth: 0,
  },
});

export const categoryStyles = {
  "children-family": { backgroundColor: "#539ed0", color: "#000" },
  food: { backgroundColor: "#ffb351", color: "#000" },
  education: { backgroundColor: "#4eb99f", color: "#000" },
  housing: { backgroundColor: "#ff443b", color: "#fff" },
  healthcare: { backgroundColor: "#f2b131", color: "#000" },
  "finance-employment": { backgroundColor: "#76ced9", color: "#000" },
  "legal-assistance": { backgroundColor: "#539ed0", color: "#fff" },
  transportation: { backgroundColor: "#f2b131", color: "#000" },
  "mental-wellness": { backgroundColor: "#4eb99f", color: "#fff" },
  "substance-use": { backgroundColor: "#ffb351", color: "#000" },
  "hygiene-household": { backgroundColor: "#76ced9", color: "#000" },
  "young-adults": { backgroundColor: "#539ed0", color: "#fff" },
  utilities: { backgroundColor: "#f2b131", color: "#000" },
};

export const highlightStyles = StyleSheet.create({
  highlight: { color: "#FFB351" },
  highlightBg: { backgroundColor: "#FFB351" },
  highlightBorder: { borderColor: "#FFB351" },
  btnHighlight: {
    backgroundColor: "#FFB351",
    color: "#000",
    // For hover effect, use TouchableOpacity's active state
  },
});

// Font family usage (Expo/React Native):
// Use "fontFamily: 'Roboto'" and "fontWeight" on your components as needed.
// Load fonts at app startup via expo-font or react-native-fonts.

export const globalStyles = StyleSheet.create({
  body: {
    fontFamily: "Roboto, Arial",
    color: "#000000",
    backgroundColor: "#fff",
  },
  h1: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 32,
    letterSpacing: 0.01,
  },
  h2: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 0.01,
  },
  h3: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 0.01,
  },
  h4: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 0.01,
  },
  paragraph: {
    color: "#000000",
    fontSize: 16,
  },
  span: {
    color: "#000000",
    fontSize: 16,
  },
  div: {
    color: "#000000",
    fontSize: 16,
  },
});

export const buttonHighlightStyles = StyleSheet.create({
  btnHighlight: {
    backgroundColor: "#FFB351",
    color: "#000",
  },
});
