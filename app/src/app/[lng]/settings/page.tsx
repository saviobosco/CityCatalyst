"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/client";
import { Trans } from "react-i18next/TransWithoutContext";
import { NavigationBar } from "@/components/navigation-bar";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListIcon,
  ListItem,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableCaption,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";

import { useSession } from "next-auth/react";
import FormInput from "@/components/form-input";
import FormSelectInput from "@/components/form-select-input";
import { SubmitHandler, useForm } from "react-hook-form";

import {
  MdMoreVert,
  MdOutlineIndeterminateCheckBox,
  MdOutlineModeEditOutline,
} from "react-icons/md";
import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { FiTrash2 } from "react-icons/fi";
import AddUserModal from "@/components/Modals/add-user-modal";
import UpdateUserModal from "@/components/Modals/update-user-modal";
import DeleteUserModal from "@/components/Modals/delete-user-modal";

export type ProfileInputs = {
  name: string;
  email: string;
  city: string;
  role: string;
};

export type UserDetails = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function Settings({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { data: session, status } = useSession();
  const [inputValue, setInputValue] = useState<string>("");
  const { t } = useTranslation(lng, "settings");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileInputs>();

  useEffect(() => {
    if (session?.user && status === "authenticated") {
      setValue("name", session.user?.name!);
      setValue("city", "City");
      setValue("email", session.user.email!);
      setValue("role", "admin");
    }
  }, [setValue, session, status]);

  const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    console.log(data);
  };

  const onInputChange = (e: any) => {
    setInputValue(e.target.value);
    console.log(e.target.value);
  };

  const [selectedUsers, setSelectedUsers] = useState<any>([]);

  const handleCheckboxChange = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers((prev: any) => [...prev, userId]);
    } else {
      setSelectedUsers((prev: []) =>
        prev.filter((id: string) => id !== userId),
      );
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<Array<UserDetails>>([]);
  const [filteredUsersByRole, setFilteredUsersByRole] = useState<
    Array<UserDetails>
  >([]);

  useEffect(() => {
    const users = [
      { id: "1", name: "John Doe", email: "john@example.com", role: "admin" },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "contributer",
      },
    ];
    const result = users.filter(
      (users) =>
        users.name
          .toLocaleLowerCase()
          .includes(searchTerm.toLocaleLowerCase()) ||
        users.email
          .toLocaleLowerCase()
          .includes(searchTerm.toLocaleLowerCase()),
    );

    setFilteredUsers(result);
    const selectedUserByRole = filteredUsers.filter((users) =>
      users.role.toLocaleLowerCase().includes(role.toLocaleLowerCase()),
    );
    if (role !== "all") {
      setFilteredUsersByRole(selectedUserByRole);
    } else {
      setFilteredUsersByRole(filteredUsers);
    }
  }, [searchTerm, filteredUsers, role]);

  const {
    isOpen: isUserModalOpen,
    onOpen: onUserModalOpen,
    onClose: onUserModalClose,
  } = useDisclosure();
  const {
    isOpen: isUserUpdateModalOpen,
    onOpen: onUserUpdateModalOpen,
    onClose: onUserUpdateModalClose,
  } = useDisclosure();

  const {
    isOpen: isUserDeleteModalOpen,
    onOpen: onUserDeleteModalOpen,
    onClose: onUserDeleteModalClose,
  } = useDisclosure();

  const [userData, setUserData] = useState<UserDetails>({
    email: "",
    id: "",
    name: "",
    role: "",
  });

  return (
    <Box backgroundColor="background.backgroundLight" paddingBottom="125px">
      <NavigationBar lng={lng} />
      <Box className="flex mx-auto w-[1090px] h-[100vh]">
        <Box>
          <Box paddingTop="64px">
            <Text
              color="content.primary"
              fontWeight="bold"
              lineHeight="40"
              fontSize="headline.lg"
              fontFamily="body"
            >
              Settings
            </Text>
            <Text
              color="content.tertiary"
              fontWeight="normal"
              lineHeight="24"
              fontFamily="heading"
              fontSize="body.lg"
              letterSpacing="wide"
              marginTop="8px"
            >
              Connect third-party data or upload your own data in order to
              compile your GHG inventory with GPC Basic methodology
            </Text>
          </Box>
          <Box marginTop="48px" borderBottomColor={"border.overlay"}>
            <Tabs>
              <TabList>
                <Tab>
                  <Text
                    fontSize="title.md"
                    fontStyle="normal"
                    lineHeight="24px"
                  >
                    My Profile
                  </Text>
                </Tab>
                <Tab>
                  <Text
                    fontSize="title.md"
                    fontStyle="normal"
                    lineHeight="24px"
                  >
                    My Files
                  </Text>
                </Tab>
                <Tab>
                  <Text
                    fontSize="title.md"
                    fontStyle="normal"
                    lineHeight="24px"
                  >
                    My Inventories
                  </Text>
                </Tab>
              </TabList>

              <TabPanels className="-ml-4">
                <TabPanel>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap="48px"
                    marginTop="32px"
                  >
                    <Box>
                      <Text
                        color="content.primary"
                        fontWeight="bold"
                        lineHeight="32"
                        fontSize="headline.sm"
                        fontFamily="body"
                        fontStyle="normal"
                      >
                        My Profile
                      </Text>
                      <Text
                        color="content.tertiary"
                        fontWeight="normal"
                        lineHeight="24"
                        fontFamily="heading"
                        fontSize="body.lg"
                        letterSpacing="wide"
                        marginTop="8px"
                      >
                        Here you can find and edit all your profile information.
                      </Text>
                    </Box>
                    <Box>
                      <Tabs
                        display="flex"
                        flexDirection="row"
                        variant="soft-rounded"
                        gap="36px"
                      >
                        <TabList
                          display="flex"
                          flexDirection="column"
                          gap="12px"
                        >
                          <Tab
                            sx={{
                              w: "223px",
                              justifyContent: "left",
                              h: "52px",
                              letterSpacing: "wide",
                              color: "content.secondary",
                              lineHeight: "20px",
                              fontStyle: "normal",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                            }}
                            _selected={{
                              color: "content.link",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                              backgroundColor: "background.neutral",
                              borderRadius: "8px",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "content.link",
                            }}
                          >
                            Account Details
                          </Tab>
                          <Tab
                            sx={{
                              w: "223px",
                              justifyContent: "left",
                              h: "52px",
                              letterSpacing: "wide",
                              color: "content.secondary",
                              lineHeight: "20px",
                              fontStyle: "normal",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                            }}
                            _selected={{
                              color: "content.link",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                              backgroundColor: "background.neutral",
                              borderRadius: "8px",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "content.link",
                            }}
                          >
                            Users
                          </Tab>
                          <Tab
                            sx={{
                              w: "223px",
                              justifyContent: "left",
                              h: "52px",
                              letterSpacing: "wide",
                              color: "content.secondary",
                              lineHeight: "20px",
                              fontStyle: "normal",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                            }}
                            _selected={{
                              color: "content.link",
                              fontSize: "label.lg",
                              fontWeight: "medium",
                              backgroundColor: "background.neutral",
                              borderRadius: "8px",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "content.link",
                            }}
                          >
                            City
                          </Tab>
                        </TabList>

                        <TabPanels backgroundColor="background.default">
                          <TabPanel
                            display="flex"
                            flexDirection="column"
                            gap="36px"
                            borderRadius="8px"
                          >
                            <Box>
                              <Text
                                color="content.primary"
                                fontWeight="semibold"
                                lineHeight="24"
                                fontSize="title.md"
                                fontFamily="body"
                                fontStyle="normal"
                              >
                                Account Details
                              </Text>
                              <Text
                                color="content.tertiary"
                                fontWeight="normal"
                                lineHeight="24"
                                fontFamily="heading"
                                fontSize="body.lg"
                                letterSpacing="wide"
                                marginTop="8px"
                              >
                                Here you can find and edit all your profile
                                information.
                              </Text>
                            </Box>
                            <Box
                              display="flex"
                              flexDirection="column"
                              gap="24px"
                            >
                              <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="flex flex-col gap-[24px]"
                              >
                                <FormInput
                                  label="Full Name"
                                  register={register}
                                  error={errors.name}
                                  id="name"
                                />
                                <FormInput
                                  label="Email"
                                  isDisabled
                                  register={register}
                                  error={errors.email}
                                  id="email"
                                />
                                <FormInput
                                  label="City or Region"
                                  register={register}
                                  error={errors.city}
                                  id="city"
                                />
                                <FormSelectInput
                                  label="Role"
                                  value={inputValue}
                                  register={register}
                                  error={errors.role}
                                  id="role"
                                  onInputChange={onInputChange}
                                />
                                <Box
                                  display="flex"
                                  w="100%"
                                  justifyContent="right"
                                  marginTop="12px"
                                >
                                  <Button
                                    type="submit"
                                    h="48px"
                                    w="169px"
                                    paddingTop="16px"
                                    paddingBottom="16px"
                                    paddingLeft="24px"
                                    paddingRight="24px"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    fontWeight="semibold"
                                    fontSize="button.md"
                                  >
                                    save changes
                                  </Button>
                                </Box>
                              </form>
                            </Box>
                          </TabPanel>
                          <TabPanel
                            width="831px"
                            padding="24px"
                            display="flex"
                            flexDirection="column"
                            gap="24px"
                          >
                            <Box
                              height="36px"
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Text
                                fontSize="title.md"
                                fontWeight="semibold"
                                lineHeight="24px"
                                color="content.secondary"
                              >
                                Manage Users
                              </Text>
                              <Button
                                aria-label="Add User"
                                leftIcon={<AddIcon />}
                                type="submit"
                                h="48px"
                                w="169px"
                                gap="8px"
                                paddingTop="16px"
                                paddingBottom="16px"
                                paddingLeft="24px"
                                paddingRight="24px"
                                letterSpacing="widest"
                                textTransform="uppercase"
                                fontWeight="semibold"
                                fontSize="button.md"
                                onClick={onUserModalOpen}
                              >
                                add user
                              </Button>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Box display="flex" gap="24px">
                                <InputGroup
                                  w="365px"
                                  height="48px"
                                  shadow="1dp"
                                  alignItems="center"
                                  display="flex"
                                  borderRadius="4px"
                                  borderWidth="1px"
                                  borderStyle="solid"
                                  borderColor="border.neutral"
                                >
                                  <InputLeftElement
                                    h="100%"
                                    display="flex"
                                    paddingLeft="10px"
                                    pointerEvents="none"
                                    alignItems="center"
                                  >
                                    <SearchIcon color="content.tertiary" />
                                  </InputLeftElement>
                                  <Input
                                    type="tel"
                                    fontSize="body.md"
                                    fontFamily="heading"
                                    letterSpacing="wide"
                                    color="content.tertiary"
                                    placeholder="Search by name or email address"
                                    border="none"
                                    h="100%"
                                    onChange={(e) =>
                                      setSearchTerm(e.target.value)
                                    }
                                  />
                                </InputGroup>
                                <Select
                                  h="48px"
                                  w="auto"
                                  borderWidth="1px"
                                  borderStyle="solid"
                                  borderColor="border.neutral"
                                  onChange={(e) => setRole(e.target.value)}
                                >
                                  <option value="all">ALL</option>
                                  <option value="admin">ADMIN</option>
                                  <option value="contributer">
                                    CONTRIBUTER
                                  </option>
                                </Select>
                              </Box>
                              <Box display="flex" alignItems="center" gap="8px">
                                <Text
                                  color="content.tertiary"
                                  fontSize="body.md"
                                  fontFamily="heading"
                                  fontWeight="normal"
                                  letterSpacing="wide"
                                >
                                  1-{filteredUsers.length} of{" "}
                                  {filteredUsers.length}
                                </Text>
                                <Box display="flex" gap="8px">
                                  <Button variant="ghost" h="24px" w="24px">
                                    <ChevronLeftIcon
                                      h="24px"
                                      w="24px"
                                      color="background.overlay"
                                    />
                                  </Button>
                                  <Button variant="ghost" h="24px" w="24px">
                                    <ChevronRightIcon
                                      h="24px"
                                      w="24px"
                                      color="content.secondary"
                                    />
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                            {selectedUsers.length > 0 && (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap="8px"
                                >
                                  <Button
                                    variant="ghost"
                                    padding="0"
                                    marginLeft="-10px"
                                    onClick={() => setSelectedUsers([])}
                                  >
                                    <MdOutlineIndeterminateCheckBox
                                      size={24}
                                      color="content.link"
                                    />
                                  </Button>
                                  <Text
                                    color="content.tertiary"
                                    fontSize="body.md"
                                    fontFamily="heading"
                                    fontWeight="normal"
                                    letterSpacing="wide"
                                  >
                                    {selectedUsers.length} Selected users
                                  </Text>
                                </Box>
                                <Box>
                                  <Button
                                    color="sentiment.negativeDefault"
                                    textTransform="capitalize"
                                    fontSize="body.md"
                                    fontFamily="heading"
                                    fontWeight="normal"
                                    letterSpacing="wide"
                                    leftIcon={<FiTrash2 size={24} />}
                                    variant="ghost"
                                  >
                                    Remove users
                                  </Button>
                                </Box>
                              </Box>
                            )}
                            <Box>
                              <TableContainer>
                                <Table
                                  variant="simple"
                                  borderWidth="1px"
                                  borderStyle="solid"
                                  borderColor="border.neutral"
                                >
                                  <Thead>
                                    <Tr>
                                      <Th>SELECT</Th>
                                      <Th>NAME</Th>
                                      <Th>EMAIL</Th>
                                      <Th>ROLE</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody fontFamily="heading">
                                    {filteredUsersByRole.map((user) => (
                                      <Tr key={user.id}>
                                        <Td>
                                          <Checkbox
                                            onChange={(e) =>
                                              handleCheckboxChange(
                                                user.id,
                                                e.target.checked,
                                              )
                                            }
                                            isChecked={selectedUsers.includes(
                                              user.id,
                                            )}
                                          />
                                        </Td>
                                        <Td>{user.name}</Td>
                                        <Td>{user.email}</Td>
                                        <Td
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="space-between"
                                        >
                                          <Badge
                                            color="blue"
                                            borderRadius="full"
                                            paddingLeft="16px"
                                            paddingRight="16px"
                                            paddingTop="4px"
                                            paddingBottom="4px"
                                            borderWidth="1px"
                                            borderStyle="solid"
                                            fontWeight="normal"
                                            textTransform="capitalize"
                                            letterSpacing="wide"
                                            fontSize="body.md"
                                            borderColor={
                                              user.role === "admin"
                                                ? "content.alternative"
                                                : "sentiment.warningDefault"
                                            }
                                            textColor={
                                              user.role === "admin"
                                                ? "content.alternative"
                                                : "sentiment.warningDefault"
                                            }
                                            backgroundColor={
                                              user.role === "admin"
                                                ? "background.neutral"
                                                : "sentiment.warningOverlay"
                                            }
                                          >
                                            {user.role}
                                          </Badge>
                                          <Popover isLazy>
                                            <PopoverTrigger>
                                              <Button
                                                variant="ghost"
                                                color="interactive.control"
                                              >
                                                <MdMoreVert size={24} />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                              h="128px"
                                              w="175px"
                                              borderRadius="8px"
                                              shadow="2dp"
                                              borderWidth="1px"
                                              borderStyle="solid"
                                              borderColor="border.neutral"
                                              padding="10px"
                                              paddingLeft="0"
                                              paddingRight="0"
                                            >
                                              <PopoverArrow />

                                              <PopoverBody padding="0">
                                                <List padding="0">
                                                  <ListItem
                                                    display="flex"
                                                    cursor="pointer"
                                                    gap="16px"
                                                    color="content.tertiary"
                                                    alignItems="center"
                                                    paddingLeft="16px"
                                                    paddingRight="16px"
                                                    paddingTop="12px"
                                                    paddingBottom="12px"
                                                    _hover={{
                                                      background:
                                                        "background.neutral",
                                                    }}
                                                    onClick={() => {
                                                      setUserData(user);
                                                      onUserUpdateModalOpen();
                                                    }}
                                                  >
                                                    <MdOutlineModeEditOutline
                                                      size={24}
                                                    />

                                                    <Text
                                                      color="content.secondary"
                                                      fontFamily="heading"
                                                      letterSpacing="wide"
                                                      fontWeight="normal"
                                                      fontSize="body.lg"
                                                    >
                                                      Edit User
                                                    </Text>
                                                  </ListItem>
                                                  <ListItem
                                                    display="flex"
                                                    cursor="pointer"
                                                    gap="16px"
                                                    color="sentiment.negativeDefault"
                                                    alignItems="center"
                                                    paddingLeft="16px"
                                                    paddingRight="16px"
                                                    paddingTop="12px"
                                                    paddingBottom="12px"
                                                    _hover={{
                                                      background:
                                                        "background.neutral",
                                                    }}
                                                    onClick={() => {
                                                      setUserData(user);
                                                      onUserDeleteModalOpen();
                                                    }}
                                                  >
                                                    <FiTrash2 size={24} />

                                                    <Text
                                                      color="content.secondary"
                                                      fontFamily="heading"
                                                      letterSpacing="wide"
                                                      fontWeight="normal"
                                                      fontSize="body.lg"
                                                    >
                                                      Remove User
                                                    </Text>
                                                  </ListItem>
                                                </List>
                                              </PopoverBody>
                                            </PopoverContent>
                                          </Popover>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </TabPanel>
                          <TabPanel>
                            <p>three!</p>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <p>two!</p>
                </TabPanel>
                <TabPanel>
                  <p>three!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Box>
      <AddUserModal isOpen={isUserModalOpen} onClose={onUserModalClose} />
      <UpdateUserModal
        isOpen={isUserUpdateModalOpen}
        onClose={onUserUpdateModalClose}
        userData={userData}
      />
      <DeleteUserModal
        isOpen={isUserDeleteModalOpen}
        onClose={onUserDeleteModalClose}
        userData={userData}
      />
    </Box>
  );
}
