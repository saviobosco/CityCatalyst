"use client";
import { api } from "@/services/api";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/client";
import { useSession } from "next-auth/react";

export default function HomePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = useTranslation(lng, "root-page");
  const router = useRouter();
  const { data: userInfo, isLoading: isUserInfoLoading } =
    api.useGetUserInfoQuery();

  // Check if user is authenticated otherwise route to login page
  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/login");
    },
  });

  useEffect(() => {
    const defaultInventoryAvailable = !!userInfo?.defaultInventoryId;
    const defaultInventoryPath = `/${userInfo?.defaultInventoryId}`;
    if (defaultInventoryAvailable) {
      router.push(defaultInventoryPath);
    } else {
      router.push("/onboarding");
    }
  }, [router, userInfo]);
  return (
    <Box
      h="100vh"
      w="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="8px"
    >
      <Spinner />
      {/* TODO: add right loading format */}
      <Text>{t("loading-dashboard")}</Text>
    </Box>
  );
}
