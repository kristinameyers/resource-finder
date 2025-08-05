import { createTamagui } from '@tamagui/core'
import { createInterFont } from '@tamagui/font-inter'
import { createMedia } from '@tamagui/helpers-tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens, themes } from '@tamagui/themes'

const headingFont = createInterFont()
const bodyFont = createInterFont()

const tamaguiConfig = createTamagui({
  animations: {
    bouncy: {
      type: 'spring',
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    lazy: {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    },
    quick: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
  },
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens: {
    ...tokens,
    color: {
      ...tokens.color,
      primary: '#005191',
      childrenFamily: '#539ed0',
      food: '#ffb351', 
      education: '#4eb99f',
      housing: '#ff443b',
      healthcare: '#f2b131',
      financeEmployment: '#76ced9',
      transportation: '#f2b131',
      mentalWellness: '#4eb99f',
      substanceUse: '#ffb351',
      hygieneHousehold: '#76ced9',
      youngAdults: '#539ed0',
      utilities: '#f2b131',
    }
  },
  themes: {
    ...themes,
    light: {
      ...themes.light,
      background: '#f5f5f5',
      backgroundHover: '#eeeeee',
      backgroundPress: '#e0e0e0',
      backgroundFocus: '#e8e8e8',
      backgroundStrong: '#005191',
      color: '#000000',
      colorHover: '#333333',
      colorPress: '#000000',
      colorFocus: '#000000',
      borderColor: '#e0e0e0',
      borderColorHover: '#cccccc',
      borderColorFocus: '#005191',
      borderColorPress: '#005191',
      placeholderColor: '#999999',
    },
  },
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
})

export type AppConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig