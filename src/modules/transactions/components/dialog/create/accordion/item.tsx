import { AccordionPanel, Box, Heading, HStack, VStack } from '@chakra-ui/react';
import React from 'react';

interface AccordionItemProps {
  title: string;
  actions: React.ReactNode;
  resume: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
}

const AccordionItem = ({
  title,
  actions,
  children,
  resume,
  isExpanded,
}: AccordionItemProps) => {
  return (
    <>
      <Box p={0} alignItems="center" justifyContent="space-between">
        <VStack w="full" py={5} px={5} alignItems="flex-start" spacing={0}>
          <HStack w="full">
            <Box w="full" flex={2}>
              <Heading fontSize="lg" fontWeight="extrabold" color="grey.200">
                {title}
              </Heading>
            </Box>
            {actions}
          </HStack>
          {
            !isExpanded && resume
            // <Text fontSize="sm" color="grey.500">
            //   0.03898 ETH to 827383764...0909
            // </Text>
          }
        </VStack>
      </Box>
      <AccordionPanel px={5}>{children}</AccordionPanel>
    </>
  );
};

export { AccordionItem };
