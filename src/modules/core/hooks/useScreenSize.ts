import { useMediaQuery } from '@chakra-ui/react';

const useScreenSize = () => {
  const [isExtraLarge] = useMediaQuery('(min-width: 85em)'); //1360px
  const [isLarge] = useMediaQuery('(max-width: 84em)'); //1344px
  const [isMobile] = useMediaQuery('(max-width: 62em)'); //992px
  const [isSmall] = useMediaQuery('(max-width: 37.48em)'); //600px
  const [isLitteSmall] = useMediaQuery('(max-width: 25em)'); //400px
  const [isExtraSmall] = useMediaQuery('(max-width: 21em)'); //336px
  const [isLowerThanFourHundredAndThirty] = useMediaQuery('(max-width: 27em)');
  const [vaultRequiredSizeToColumnLayout] = useMediaQuery(
    '(max-width: 75.62em)',
  ); //1210px

  const [isMdHeight] = useMediaQuery('(max-height: 48em)'); //768px
  const [isSmallHeight] = useMediaQuery('(max-height: 37.48em)'); //600px
  const [isXSHeight] = useMediaQuery('(max-height: 33.125em)'); //530px

  const isExtraSmallDevice = isMdHeight && isMobile;

  return {
    isLarge,
    isMobile,
    isSmall,
    isLitteSmall,
    vaultRequiredSizeToColumnLayout,
    isExtraSmall,
    isMdHeight,
    isSmallHeight,
    isXSHeight,
    isExtraSmallDevice,
    isExtraLarge,
    isLowerThanFourHundredAndThirty,
  };
};

export { useScreenSize };
