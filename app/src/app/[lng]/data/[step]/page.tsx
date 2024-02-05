"use client";

import { SegmentedProgress } from "@/components/SegmentedProgress";
import { CircleIcon, DataAlertIcon, WorldSearchIcon } from "@/components/icons";
import WizardSteps from "@/components/wizard-steps";
import { useTranslation } from "@/i18n/client";
import { ScopeAttributes } from "@/models/Scope";
import { api } from "@/services/api";
import type { DataSource, SectorProgress } from "@/util/types";
import { ArrowBackIcon, SearchIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useDisclosure,
  useSteps,
  useToast,
} from "@chakra-ui/react";
import { TFunction } from "i18next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next/TransWithoutContext";
import { FiTarget, FiTrash2, FiTruck } from "react-icons/fi";
import {
  MdAdd,
  MdArrowDropDown,
  MdArrowDropUp,
  MdCheckCircle,
  MdHomeWork,
  MdOutlineCheckCircle,
  MdOutlineEdit,
  MdOutlineHomeWork,
  MdOutlineSkipNext,
  MdPlaylistAddCheck,
  MdRefresh,
} from "react-icons/md";
import { SourceDrawer } from "./SourceDrawer";
import { SubsectorDrawer } from "./SubsectorDrawer";
import type { DataStep, SubSector } from "./types";
import { nameToI18NKey } from "@/util/helpers";
import { logger } from "@/services/logger";

function getMailURI(locode?: string, sector?: string, year?: number): string {
  const emails =
    process.env.NEXT_PUBLIC_SUPPORT_EMAILS ||
    "info@openearth.org,greta@openearth.org";
  return `mailto://${emails}?subject=Missing third party data sources&body=City: ${locode}%0ASector: ${sector}%0AYear: ${year}`;
}

function SearchDataSourcesPrompt({
  t,
  isSearching,
  isDisabled,
  onSearchClicked,
}: {
  t: TFunction;
  isSearching: boolean;
  isDisabled: boolean;
  onSearchClicked: () => void;
}) {
  return (
    <Flex align="center" direction="column">
      <Icon
        as={WorldSearchIcon}
        boxSize={20}
        color="interactive.secondary"
        borderRadius="full"
        p={4}
        bgColor="background.neutral"
        mb={6}
      />
      <Button
        variant="solid"
        leftIcon={<SearchIcon boxSize={6} />}
        isLoading={isSearching}
        isDisabled={isDisabled}
        loadingText={t("searching")}
        onClick={onSearchClicked}
        mb={2}
        px={6}
        h={16}
        py={4}
      >
        {t("search-available-datasets")}
      </Button>
      <Text color="content.tertiary" align="center" size="sm" variant="spaced">
        {t("wait-for-search")}
      </Text>
    </Flex>
  );
}

function NoDataSourcesMessage({
  t,
  locode,
  sector,
  year,
}: {
  t: TFunction;
  locode?: string;
  sector?: string;
  year?: number;
}) {
  return (
    <Flex align="center" direction="column">
      <Icon
        as={WorldSearchIcon}
        boxSize={20}
        color="interactive.secondary"
        borderRadius="full"
        p={4}
        bgColor="background.neutral"
        mb={6}
      />
      <Heading
        size="lg"
        color="interactive.secondary"
        mb={2}
        textAlign="center"
      >
        {t("no-data-sources")}
      </Heading>
      <Text color="content.tertiary" align="center" size="sm">
        <Trans t={t} i18nKey="no-data-sources-description">
          I<br />I
          <Link href={getMailURI(locode, sector, year)} className="underline">
            please report this
          </Link>
          I
        </Trans>
      </Text>
    </Flex>
  );
}

export default function AddDataSteps({
  params: { lng, step },
}: {
  params: { lng: string; step: string };
}) {
  const { t } = useTranslation(lng, "data");
  const router = useRouter();
  const toast = useToast();

  const { data: userInfo, isLoading: isUserInfoLoading } =
    api.useGetUserInfoQuery();
  const locode = userInfo?.defaultCityLocode;
  const year = userInfo?.defaultInventoryYear;

  const {
    data: inventoryProgress,
    isLoading: isInventoryProgressLoading,
    error: inventoryProgressError,
  } = api.useGetInventoryProgressQuery(
    { locode: locode!, year: year! },
    { skip: !locode || !year },
  );
  const isInventoryLoading = isUserInfoLoading || isInventoryProgressLoading;

  const [
    loadDataSources,
    {
      data: allDataSources,
      isLoading: areDataSourcesLoading,
      isFetching: areDataSourcesFetching,
      error: dataSourcesError,
    },
  ] = api.useLazyGetAllDataSourcesQuery();

  const [connectDataSource, { isLoading: isConnectDataSourceLoading }] =
    api.useConnectDataSourceMutation();

  const [steps, setSteps] = useState<DataStep[]>([
    {
      title: t("stationary-energy"),
      details: t("stationary-energy-details"),
      icon: MdOutlineHomeWork,
      connectedProgress: 0,
      addedProgress: 0,
      totalSubSectors: 0,
      referenceNumber: "I",
      sector: null,
      subSectors: null,
    },
    {
      title: t("transportation"),
      details: t("transportation-details"),
      icon: FiTruck,
      connectedProgress: 0,
      addedProgress: 0,
      totalSubSectors: 0,
      referenceNumber: "II",
      sector: null,
      subSectors: null,
    },
    {
      title: t("waste"),
      details: t("waste-details"),
      icon: FiTrash2,
      connectedProgress: 0,
      addedProgress: 0,
      totalSubSectors: 0,
      referenceNumber: "III",
      sector: null,
      subSectors: null,
    },
  ]);

  useEffect(() => {
    if (inventoryProgress == null) {
      return;
    }

    const progress = inventoryProgress.sectorProgress;
    const updatedSteps = steps.map((step) => {
      const sectorProgress: SectorProgress | undefined = progress.find(
        (p) => p.sector.referenceNumber === step.referenceNumber,
      );
      if (!sectorProgress) {
        console.error(
          "No progress entry found for sector",
          step.referenceNumber,
        );
        return step;
      }
      step.sector = sectorProgress.sector;
      step.subSectors = sectorProgress.subSectors;
      step.totalSubSectors = sectorProgress.total;
      if (sectorProgress.total === 0) {
        return step;
      }
      const connectedProgress =
        sectorProgress.thirdParty / sectorProgress.total;
      const addedProgress = sectorProgress.uploaded / sectorProgress.total;
      step.connectedProgress = Math.max(
        connectedProgress,
        step.connectedProgress,
      );
      step.addedProgress = Math.max(addedProgress, step.addedProgress);
      return step;
    });
    setSteps(updatedSteps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryProgress]);

  const { activeStep, goToNext, setActiveStep } = useSteps({
    index: Number(step) - 1,
    count: steps.length,
  });
  const currentStep = steps[activeStep];
  const onStepSelected = (selectedStep: number) => {
    setActiveStep(selectedStep);
  };
  useEffect(() => {
    // change step param in URL without reloading
    const newPath = location.pathname.replace(
      /\/[0-9]+$/,
      `/${activeStep + 1}`,
    );
    history.replaceState("", "", newPath);
  }, [activeStep]);

  const totalStepCompletion = currentStep
    ? currentStep.connectedProgress + currentStep.addedProgress
    : 0;
  const formatPercentage = (percentage: number) =>
    Math.round(percentage * 1000) / 10;

  // only display data sources relevant to current sector
  const dataSources = allDataSources?.filter(({ source, data }) => {
    const referenceNumber =
      source.subCategory?.referenceNumber || source.subSector?.referenceNumber;
    if (!data) return false;
    if (!referenceNumber) return false;
    const sectorReferenceNumber = referenceNumber.split(".")[0];

    return sectorReferenceNumber === currentStep.referenceNumber;
  });

  const [selectedSource, setSelectedSource] = useState<DataSource>();
  const {
    isOpen: isSourceDrawerOpen,
    onClose: onSourceDrawerClose,
    onOpen: onSourceDrawerOpen,
  } = useDisclosure();
  const onSourceClick = (source: DataSource) => {
    setSelectedSource(source);
    onSourceDrawerOpen();
  };

  const showError = (title: string, description: string) => {
    toast({
      title,
      description,
      status: "error",
      isClosable: true,
    });
  };

  const [connectingDataSourceId, setConnectingDataSourceId] = useState<
    string | null
  >(null);
  const [newlyConnectedDataSourceIds, setNewlyConnectedDataSourceIds] =
    useState<string[]>([]);
  const onConnectClick = async (source: DataSource) => {
    if (!inventoryProgress) {
      console.error(
        "Tried to assign data source while inventory progress was not yet loaded!",
      );
      return;
    }
    logger.debug("Connect source", source);
    setConnectingDataSourceId(source.datasourceId);
    try {
      const response = await connectDataSource({
        inventoryId: inventoryProgress.inventoryId,
        dataSourceIds: [source.datasourceId],
      }).unwrap();

      if (response.failed.length > 0) {
        showError(
          t("data-source-connect-failed"),
          t("data-source-connect-load-error"),
        );
        return;
      } else if (response.invalid.length > 0) {
        showError(
          t("data-source-connect-failed"),
          t("data-source-connect-invalid-error"),
        );
        return;
      }

      if (response.successful.length > 0) {
        setNewlyConnectedDataSourceIds(
          newlyConnectedDataSourceIds.concat(response.successful),
        );
        onSourceDrawerClose();
      }
    } catch (error: any) {
      console.error("Failed to connect data source", source, error);
      toast({
        title: t("data-source-connect-failed"),
        description: error.data?.error?.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setConnectingDataSourceId(null);
    }
  };

  function isSourceConnected(source: DataSource): boolean {
    return (
      (source.inventoryValues && source.inventoryValues.length > 0) ||
      newlyConnectedDataSourceIds.indexOf(source.datasourceId) > -1
    );
  }

  function onSearchDataSourcesClicked() {
    if (inventoryProgress) {
      loadDataSources({ inventoryId: inventoryProgress.inventoryId });
    } else {
      console.error("Inventory progress is still loading!");
    }
  }

  const [selectedSubsector, setSelectedSubsector] = useState<SubSector>();
  const {
    isOpen: isSubsectorDrawerOpen,
    onClose: onSubsectorDrawerClose,
    onOpen: onSubsectorDrawerOpen,
  } = useDisclosure();
  const onSubsectorClick = (subsector: SubSector) => {
    logger.debug(subsector);
    setSelectedSubsector(subsector);
    onSubsectorDrawerOpen();
  };
  const onSubsectorSave = (subsector: SubSector) => {
    logger.debug("Save subsector", subsector);
  };

  const [isConfirming, setConfirming] = useState(false);
  const onConfirm = async () => {
    setConfirming(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConfirming(false);
    if (activeStep >= steps.length - 1) {
      router.push("/"); // go back to dashboard until there is a confirmation page
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      goToNext();
    }
  };

  const onSkip = () => {
    if (activeStep >= steps.length - 1) {
      router.push("/"); // go back to dashboard until there is a confirmation page
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      goToNext();
    }
  };

  const [isDataSectionExpanded, setDataSectionExpanded] = useState(false);

  return (
    <div className="pt-16 pb-16 w-[1090px] max-w-full mx-auto px-4">
      <Button
        variant="ghost"
        leftIcon={<ArrowBackIcon boxSize={6} />}
        onClick={() => router.back()}
      >
        {t("go-back")}
      </Button>
      <div className="w-full flex md:justify-center mb-8">
        <div className="lg:w-[900px] max-w-full">
          <WizardSteps
            currentStep={activeStep}
            steps={steps}
            onSelect={onStepSelected}
          />
        </div>
      </div>
      {/*** Sector summary section ***/}
      <Card mb={12}>
        <Flex direction="row">
          <Icon
            as={currentStep.icon}
            boxSize={8}
            color="brand.secondary"
            mr={4}
          />
          <div className="space-y-4 w-full">
            <Heading
              fontSize="24px"
              fontWeight="semibold"
              textTransform="capitalize"
              lineHeight="32px"
              size="lg"
              mb={2}
            >
              {currentStep.title}
            </Heading>
            <Text color="content.tertiary">{currentStep.details}</Text>
            <Flex direction="row">
              <SegmentedProgress
                values={[
                  currentStep.connectedProgress,
                  currentStep.addedProgress,
                ]}
                height={4}
              />
              <Heading size="sm" ml={6} className="whitespace-nowrap -mt-1">
                {t("completion-percent", {
                  progress: formatPercentage(totalStepCompletion),
                })}
              </Heading>
            </Flex>
            <Tag mr={4}>
              <TagLeftIcon
                as={CircleIcon}
                boxSize={6}
                color="interactive.quaternary"
              />
              <TagLabel>
                {t("data-connected-percent", {
                  progress: formatPercentage(currentStep.connectedProgress),
                })}
              </TagLabel>
            </Tag>
            <Tag>
              <TagLeftIcon
                as={CircleIcon}
                boxSize={6}
                color="interactive.tertiary"
              />
              <TagLabel>
                {t("data-added-percent", {
                  progress: formatPercentage(currentStep.addedProgress),
                })}
              </TagLabel>
            </Tag>
          </div>
        </Flex>
      </Card>
      {/*** Third party data source section ***/}
      <Card mb={12}>
        <Flex
          align="center"
          verticalAlign="center"
          justify="space-between"
          mb={12}
        >
          <Stack>
            <Heading size="lg" mb={2}>
              {t("check-data-heading")}
            </Heading>
            <Text color="content.tertiary" variant="spaced">
              {t("check-data-details")}
            </Text>
          </Stack>
          {dataSources && (
            <IconButton
              variant="solidIcon"
              icon={<Icon as={MdRefresh} boxSize={9} />}
              aria-label="Refresh"
              size="lg"
              h={16}
              w={16}
              isLoading={areDataSourcesFetching}
              onClick={onSearchDataSourcesClicked}
            />
          )}
        </Flex>
        {!dataSources ? (
          <SearchDataSourcesPrompt
            t={t}
            isSearching={areDataSourcesLoading}
            isDisabled={!inventoryProgress}
            onSearchClicked={onSearchDataSourcesClicked}
          />
        ) : dataSourcesError ? (
          <Center>
            <WarningIcon boxSize={8} color="semantic.danger" />
          </Center>
        ) : dataSources && dataSources.length === 0 ? (
          <NoDataSourcesMessage
            t={t}
            sector={currentStep.referenceNumber}
            locode={locode || undefined}
            year={year || undefined}
          />
        ) : (
          <SimpleGrid columns={3} spacing={4}>
            {dataSources
              .slice(0, isDataSectionExpanded ? dataSources.length : 6)
              .map(({ source, data }) => (
                <Card
                  key={source.datasourceId}
                  variant="outline"
                  borderColor={
                    (isSourceConnected(source) && "interactive.tertiary") ||
                    undefined
                  }
                  borderWidth={2}
                  className="shadow-none hover:drop-shadow-xl transition-shadow"
                >
                  {/* TODO add icon to DataSource */}
                  <Icon as={MdHomeWork} boxSize={9} mb={6} />
                  <Heading size="sm" noOfLines={2} minHeight={10}>
                    {source.name}
                  </Heading>
                  <Flex direction="row" my={4}>
                    <Tag mr={1}>
                      <TagLeftIcon
                        as={MdPlaylistAddCheck}
                        boxSize={4}
                        color="content.tertiary"
                      />
                      <TagLabel fontSize={12}>
                        {t("data-quality")}:{" "}
                        {t("quality-" + source.dataQuality)}
                      </TagLabel>
                    </Tag>
                    <Tag>
                      <TagLeftIcon
                        as={FiTarget}
                        boxSize={4}
                        color="content.tertiary"
                      />
                      <TagLabel fontSize={12}>
                        {t("scope")}:{" "}
                        {source.scopes
                          .map((s: ScopeAttributes) => s.scopeName)
                          .join(", ")}
                      </TagLabel>
                    </Tag>
                  </Flex>
                  <Text color="content.tertiary" noOfLines={5} minHeight={120}>
                    {source.description}
                  </Text>
                  <Link
                    className="underline"
                    mt={4}
                    mb={6}
                    onClick={() => onSourceClick(source)}
                  >
                    {t("see-more-details")}
                  </Link>
                  {isSourceConnected(source) ? (
                    <Button
                      variant="solidPrimary"
                      px={6}
                      py={4}
                      leftIcon={<Icon as={MdCheckCircle} />}
                    >
                      {t("data-connected")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      bgColor="background.neutral"
                      onClick={() => onConnectClick(source)}
                      isLoading={
                        isConnectDataSourceLoading &&
                        source.datasourceId === connectingDataSourceId
                      }
                    >
                      {t("connect-data")}
                    </Button>
                  )}
                </Card>
              ))}
          </SimpleGrid>
        )}
        {dataSources && dataSources.length > 6 && (
          <Button
            variant="ghost"
            color="content.tertiary"
            onClick={() => setDataSectionExpanded(!isDataSectionExpanded)}
            mt={8}
            fontWeight="normal"
            rightIcon={
              <Icon
                boxSize={6}
                as={isDataSectionExpanded ? MdArrowDropUp : MdArrowDropDown}
              />
            }
          >
            {t(isDataSectionExpanded ? "less-datasets" : "more-datasets")}
          </Button>
        )}
      </Card>
      {/*** Manual data entry section for subsectors ***/}
      <Card mb={48}>
        <Heading size="lg" mb={2}>
          {t("add-data-heading")}
        </Heading>
        <Text color="content.tertiary" mb={12}>
          {t("add-data-details")}
        </Text>
        <Heading size="sm" mb={4}>
          {t("select-subsector")}
        </Heading>
        <SimpleGrid minChildWidth="250px" spacing={4}>
          {isInventoryLoading || !currentStep.subSectors ? (
            <Center>
              <Spinner size="lg" />
            </Center>
          ) : inventoryProgressError ? (
            <Center>
              <WarningIcon boxSize={8} color="semantic.danger" />
            </Center>
          ) : (
            currentStep.subSectors.map((subSector: SubSector) => (
              <Card
                maxHeight="120px"
                height="120px"
                w="full"
                className="hover:drop-shadow-xl transition-shadow"
                onClick={() => onSubsectorClick(subSector)}
                key={subSector.subsectorId}
              >
                <Flex direction="row" className="space-x-4 items-center h-full">
                  <Icon
                    as={
                      subSector.completed ? MdOutlineCheckCircle : DataAlertIcon
                    }
                    boxSize={8}
                    color={
                      subSector.completed
                        ? "interactive.tertiary"
                        : "sentiment.warningDefault"
                    }
                  />
                  <Stack w="full">
                    <Heading size="xs" noOfLines={3} maxWidth="200px">
                      {t(nameToI18NKey(subSector.subsectorName))}
                    </Heading>
                    {subSector.scope && (
                      <Text color="content.tertiary">
                        {t("scope")}: {subSector.scope.scopeName}
                      </Text>
                    )}
                  </Stack>
                  <IconButton
                    aria-label={t("edit-subsector")}
                    variant="solidIcon"
                    icon={
                      <Icon
                        as={subSector.completed ? MdOutlineEdit : MdAdd}
                        boxSize={6}
                      />
                    }
                  />
                </Flex>
              </Card>
            ))
          )}
        </SimpleGrid>
      </Card>
      {/*** Bottom bar ***/}
      <div className="bg-white w-full fixed bottom-0 left-0 border-t-4 border-brand py-4 px-4 drop-shadow-2xl hover:drop-shadow-4xl transition-all">
        <Box className="w-[1090px] max-w-full mx-auto flex flex-row flex-wrap gap-y-2">
          <Box className="grow w-full md:w-0">
            <Text fontSize="sm">Step {activeStep + 1}</Text>
            <Text fontSize="2xl" as="b">
              {steps[activeStep]?.title}
            </Text>
          </Box>
          <Button
            h={16}
            onClick={onSkip}
            variant="ghost"
            leftIcon={<Icon as={MdOutlineSkipNext} boxSize={6} />}
            size="sm"
            px={8}
            mr={4}
          >
            {t("skip-step-button")}
          </Button>
          <Button
            h={16}
            isLoading={isConfirming}
            px={8}
            onClick={onConfirm}
            size="sm"
          >
            {t("save-continue-button")}
          </Button>
        </Box>
      </div>
      {/*** Drawers ***/}
      <SourceDrawer
        source={selectedSource}
        isOpen={isSourceDrawerOpen}
        onClose={onSourceDrawerClose}
        onConnectClick={() => onConnectClick(selectedSource!)}
        isConnectLoading={isConnectDataSourceLoading}
        t={t}
      />
      <SubsectorDrawer
        subSector={selectedSubsector}
        sectorName={currentStep.title}
        inventoryId={inventoryProgress?.inventoryId}
        isOpen={isSubsectorDrawerOpen}
        onClose={onSubsectorDrawerClose}
        onSave={onSubsectorSave}
        t={t}
      />
    </div>
  );
}
