import type { CSSObject } from '@emotion/styled'
// MUI Imports

import type { Theme } from '@mui/material/styles'

// Type Imports

import type { VerticalNavState } from '@menu/contexts/verticalNavContext'

// Util Imports

import { menuClasses, verticalNavClasses } from '@menu/utils/menuClasses'

const navigationCustomStyles = (verticalNavOptions: VerticalNavState, theme: Theme): CSSObject => {

  // Vars

  const { collapsedWidth, isCollapsed, isHovered, transitionDuration } = verticalNavOptions

  const collapsedHovered = isCollapsed && isHovered

  const collapsedNotHovered = isCollapsed && !isHovered

  return {

    color: 'var(--mui-palette-text-primary)',

    zIndex: 'var(--drawer-z-index) !important',

    fontFamily: "'Poppins', sans-serif !important",

    [`& .${verticalNavClasses.header}`]: {

      paddingBlock: theme.spacing(5),

      paddingInline: theme.spacing(5.5, 4),

      fontFamily: "'Poppins', sans-serif !important",

      ...(collapsedNotHovered && {

        paddingInline: theme.spacing(((collapsedWidth as number) - 35) / 8),

        '& a': {

          transform: `translateX(-${22 - ((collapsedWidth as number) - 29) / 2}px)`

        }

      }),

      '& a': {

        transition: `transform ${transitionDuration}ms ease`

      }

    },

    [`& .${verticalNavClasses.container}`]: {

      transition: theme.transitions.create(['inline-size', 'inset-inline-start', 'box-shadow', 'background-color', 'border-color'], {

        duration: transitionDuration,

        easing: 'ease-in-out'

      }),

      position: 'relative' as const,

      zIndex: '10 !important',

      fontFamily: "'Poppins', sans-serif !important",

      backgroundColor: '#FFFFFF !important',

      borderRight: '1px solid #E2E8F0 !important',

      borderColor: '#E2E8F0 !important',

      boxShadow: 'none',

      ...(verticalNavOptions.isBreakpointReached && {

        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important'

      }),

      '[data-skin="bordered"] &': {

        boxShadow: 'none',

        ...(collapsedHovered && {

          boxShadow: 'var(--mui-customShadows-sm)'

        }),

        borderRight: '1px solid #E2E8F0 !important'

      },

      '[data-mui-color-scheme="dark"] &, [data-theme="dark"] &, .dark &': {

        backgroundColor: '#0F172A !important',

        borderRight: '1px solid #1E293B !important',

        borderColor: '#1E293B !important'

      }

    },

    [`& .${verticalNavClasses.bgColorContainer}`]: {

      position: 'relative' as const,

      zIndex: '11 !important',

      backgroundColor: 'transparent !important',

      fontFamily: "'Poppins', sans-serif !important"

    },

    [`& .${menuClasses.root}`]: {

      paddingBlock: theme.spacing(1),

      paddingInline: theme.spacing(3),

      fontFamily: "'Poppins', sans-serif !important"

    },

    [`& .${verticalNavClasses.backdrop}`]: {

      zIndex: '1 !important',

      backgroundColor: 'rgba(15, 23, 42, 0.45) !important',

      backdropFilter: 'blur(3px)'

    }

  }

}

export default navigationCustomStyles

