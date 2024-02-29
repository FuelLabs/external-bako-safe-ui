import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { Card, ErrorIcon } from '@/components';
import { useAddressBook } from '@/modules/addressBook';
import {
  AddressUtils,
  Member,
  Pages,
  PermissionRoles,
  Workspace,
} from '@/modules/core';
import { useGetCurrentWorkspace } from '@/modules/workspace/hooks';
import { WorkspacePermissionUtils } from '@/modules/workspace/utils';
import { useAuth } from '../../../auth/hooks/useAuth';

interface WorkspaceSettingsDrawerProps
  extends Pick<DrawerProps, 'isOpen' | 'onClose'> {}

interface MemberCardProps {
  member: Member;
  workspace: Workspace;
  onEdit: (memberId: string) => void;
}

const MemberCard = ({ member, workspace, onEdit }: MemberCardProps) => {
  const { permissions: loggedPermissions } = useAuth();

  const permission = WorkspacePermissionUtils.getPermissionInWorkspace(
    workspace!,
    member,
  );

  const { contactByAddress } = useAddressBook();

  //TODO: Use this validation to delete button
  const isEditable =
    WorkspacePermissionUtils.hasPermissions(loggedPermissions!, [
      PermissionRoles.ADMIN,
      PermissionRoles.OWNER,
    ]) && permission?.title?.toUpperCase() !== PermissionRoles.OWNER;

  return (
    <Card w="full" bgColor="dark.300" key={member.id}>
      <HStack w="full" justifyContent="space-between">
        <Center gap={3}>
          <Avatar
            size="md"
            fontSize="md"
            color="white"
            bg="grey.900"
            variant="roundedSquare"
            name={contactByAddress(member.address!)?.nickname ?? member.address}
          />
          <Box mr={1}>
            <Text fontWeight="semibold" color="grey.200">
              {member.name}
            </Text>
            <Text
              fontWeight="normal"
              color={!member.name ? 'grey.200' : 'grey.500'}
            >
              {contactByAddress(member.address!)?.nickname ??
                AddressUtils.format(member.address)}
            </Text>
          </Box>
          <Badge fontSize="xs" p={1} variant={permission?.variant}>
            {permission?.title}
          </Badge>
        </Center>
        {isEditable && (
          <Button
            size="sm"
            variant="secondary"
            bgColor="dark.100"
            border="none"
            onClick={() => onEdit(member.id)}
          >
            Edit
          </Button>
        )}
      </HStack>
    </Card>
  );
};

const WorkspaceSettingsDrawer = ({
  ...drawerProps
}: WorkspaceSettingsDrawerProps) => {
  const navigate = useNavigate();

  const request = useGetCurrentWorkspace();

  return (
    <Drawer {...drawerProps} size="md" variant="glassmorphic" placement="right">
      <DrawerOverlay />
      <DrawerContent>
        <Flex mb={5} w="full" justifyContent="flex-end">
          <HStack cursor="pointer" onClick={drawerProps.onClose} spacing={2}>
            <ErrorIcon />
            <Text fontWeight="semibold" color="white">
              Close
            </Text>
          </HStack>
        </Flex>

        <DrawerHeader mb={10}>
          <VStack alignItems="flex-start" spacing={5}>
            <Heading fontSize="xl" fontWeight="semibold" color="grey.200">
              Workspace settings
            </Heading>
            <Text variant="description">
              You can view the details, members, and their roles in your
              workspace.
            </Text>
          </VStack>
        </DrawerHeader>

        <DrawerBody>
          <Card mb={10} bgColor="dark.200">
            <HStack spacing={5}>
              <Avatar
                p={10}
                size="lg"
                fontSize="md"
                color="white"
                bg="grey.900"
                variant="roundedSquare"
                name={request.workspace?.name}
              />
              <Box>
                <Heading mb={1} variant="title-xl" isTruncated maxW={600}>
                  {request.workspace?.name}
                </Heading>
                <Text variant="description">
                  {request.workspace?.description}
                </Text>
              </Box>
            </HStack>
          </Card>

          <Flex
            w="full"
            mb={10}
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading fontSize="xl" fontWeight="semibold" color="grey.200">
              Members
            </Heading>

            <Button
              size="sm"
              variant="secondary"
              bgColor="dark.100"
              border="none"
              onClick={() => {
                navigate(
                  Pages.membersWorkspace({
                    workspaceId: request.workspace?.id ?? '',
                  }),
                );
              }}
            >
              Add new member
            </Button>
          </Flex>

          <VStack w="full">
            {!!request.workspace?.members &&
              request.workspace?.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  workspace={request.workspace!}
                  onEdit={(memberId) =>
                    navigate(
                      Pages.updateMemberWorkspace({
                        workspaceId: request.workspace!.id,
                        memberId,
                      }),
                    )
                  }
                />
              ))}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export { WorkspaceSettingsDrawer };
