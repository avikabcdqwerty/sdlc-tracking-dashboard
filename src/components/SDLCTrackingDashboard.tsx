import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Input,
  Select,
  Badge,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { WarningTwoIcon, SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import { getSession } from 'next-auth/react'; // For RBAC, assuming next-auth is used
import { fetchProjectsWithSDLCStatus } from '../api/sdlcDashboardApi'; // Abstracted API call
import { Project, SDLCStage, SDLCStatus, UserRole } from '../types'; // Shared types/interfaces

/**
 * SDLCTrackingDashboard
 * Main dashboard component for visualizing SDLC stages, status, bottleneck indicators, and project filtering/search.
 * RBAC enforced at UI level; API endpoints must also enforce RBAC.
 */
const SDLCTrackingDashboard: React.FC = () => {
  // State for session/user role
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // State for projects and SDLC data
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // RBAC: Only allow Project Manager or higher
  useEffect(() => {
    setIsLoadingSession(true);
    getSession()
      .then((session) => {
        if (!session || !session.user || !session.user.role) {
          setUserRole(null);
        } else {
          setUserRole(session.user.role as UserRole);
        }
      })
      .catch(() => {
        setUserRole(null);
      })
      .finally(() => setIsLoadingSession(false));
  }, []);

  // Fetch projects and SDLC status
  const fetchData = useCallback(async () => {
    setIsLoadingProjects(true);
    setError(null);
    try {
      const data = await fetchProjectsWithSDLCStatus();
      setProjects(data);
      setFilteredProjects(data);
      // Default to first project if available
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      // Log error for monitoring, but show generic message to user
      // eslint-disable-next-line no-console
      console.error('Error fetching SDLC dashboard data:', err);
      setError(
        'Unable to load dashboard data at this time. Please try again later or contact support.'
      );
      toast({
        title: 'Error',
        description:
          'Dashboard data could not be loaded. No sensitive information was exposed.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userRole && (userRole === 'PROJECT_MANAGER' || userRole === 'ADMIN')) {
      fetchData();
    }
  }, [userRole, fetchData]);

  // Filtering/search logic
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProjects(
        projects.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.code.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, projects]);

  // Get selected project details
  const selectedProject = filteredProjects.find(
    (p) => p.id === selectedProjectId
  );

  // Bottleneck detection logic
  const isStageBottleneck = (stage: SDLCStage): boolean => {
    // Bottleneck if delayed or unmet entry/exit criteria
    return (
      stage.status === SDLCStatus.DELAYED ||
      !stage.entryCriteriaMet ||
      !stage.exitCriteriaMet
    );
  };

  // RBAC: Unauthorized message
  if (!isLoadingSession && (!userRole || (userRole !== 'PROJECT_MANAGER' && userRole !== 'ADMIN'))) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Alert status="error" variant="subtle" borderRadius="md" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to view the SDLC Tracking Dashboard. Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Box>
        </Alert>
      </Flex>
    );
  }

  // Loading state
  if (isLoadingSession || isLoadingProjects) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
        <Text ml={4} fontSize="lg">
          Loading dashboard...
        </Text>
      </Flex>
    );
  }

  // Error state
  if (error) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Alert status="error" variant="subtle" borderRadius="md" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Dashboard Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
            <IconButton
              aria-label="Retry"
              icon={<RepeatIcon />}
              mt={2}
              onClick={fetchData}
              colorScheme="blue"
              variant="outline"
              size="sm"
            />
          </Box>
        </Alert>
      </Flex>
    );
  }

  // Main dashboard UI
  return (
    <Box p={{ base: 4, md: 8 }} maxW="6xl" mx="auto">
      <Heading as="h1" size="xl" mb={6}>
        SDLC Tracking Dashboard
      </Heading>
      <Text mb={4} color="gray.600">
        Visualize project SDLC stage status, identify bottlenecks, and manage risks proactively.
      </Text>

      {/* Project Search & Filter */}
      <Flex mb={6} align="center" gap={4} flexWrap="wrap">
        <Input
          placeholder="Search projects by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
          leftIcon={<SearchIcon />}
          aria-label="Search projects"
        />
        <Select
          placeholder="Select a project"
          value={selectedProjectId ?? ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          maxW="300px"
          aria-label="Select project"
        >
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.code})
            </option>
          ))}
        </Select>
        <IconButton
          aria-label="Refresh"
          icon={<RepeatIcon />}
          onClick={fetchData}
          colorScheme="blue"
          variant="outline"
          size="md"
        />
      </Flex>

      {/* No projects found */}
      {filteredProjects.length === 0 && (
        <Alert status="info" variant="subtle" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>No Projects Found</AlertTitle>
            <AlertDescription>
              No projects match your search/filter criteria.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* SDLC Stages Table */}
      {selectedProject && (
        <Box borderWidth={1} borderRadius="lg" p={6} bg="white" boxShadow="md">
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap">
            <Box>
              <Heading as="h2" size="md">
                {selectedProject.name} ({selectedProject.code})
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Status: <Badge colorScheme={selectedProject.isActive ? 'green' : 'red'}>
                  {selectedProject.isActive ? 'In Progress' : 'Inactive'}
                </Badge>
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Last Updated: {new Date(selectedProject.updatedAt).toLocaleString()}
              </Text>
            </Box>
          </Flex>
          <Divider mb={4} />

          <VStack align="stretch" spacing={4}>
            {selectedProject.sdlcStages.map((stage) => (
              <Box
                key={stage.id}
                borderWidth={1}
                borderRadius="md"
                p={4}
                bg={isStageBottleneck(stage) ? 'red.50' : 'gray.50'}
                borderColor={isStageBottleneck(stage) ? 'red.300' : 'gray.200'}
                position="relative"
                transition="background 0.2s"
              >
                <HStack justify="space-between" align="center">
                  <Flex align="center">
                    <Heading as="h3" size="sm" mr={2}>
                      {stage.name}
                    </Heading>
                    {isStageBottleneck(stage) && (
                      <Tooltip label="Bottleneck detected: Delayed or unmet criteria" hasArrow>
                        <Badge colorScheme="red" fontSize="0.9em" px={2} py={1} borderRadius="md" mr={2}>
                          <WarningTwoIcon mr={1} /> Bottleneck
                        </Badge>
                      </Tooltip>
                    )}
                  </Flex>
                  <Badge
                    colorScheme={
                      stage.status === SDLCStatus.COMPLETED
                        ? 'green'
                        : stage.status === SDLCStatus.IN_PROGRESS
                        ? 'blue'
                        : stage.status === SDLCStatus.DELAYED
                        ? 'red'
                        : 'gray'
                    }
                    fontSize="0.9em"
                  >
                    {stage.status.replace('_', ' ')}
                  </Badge>
                </HStack>
                <Flex mt={2} gap={6} flexWrap="wrap">
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Entry Criteria:{' '}
                      <Badge colorScheme={stage.entryCriteriaMet ? 'green' : 'red'}>
                        {stage.entryCriteriaMet ? 'Met' : 'Unmet'}
                      </Badge>
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Exit Criteria:{' '}
                      <Badge colorScheme={stage.exitCriteriaMet ? 'green' : 'red'}>
                        {stage.exitCriteriaMet ? 'Met' : 'Unmet'}
                      </Badge>
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Delayed Tasks:{' '}
                      <Badge colorScheme={stage.delayedTasks > 0 ? 'red' : 'green'}>
                        {stage.delayedTasks}
                      </Badge>
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Owner:{' '}
                      <Badge colorScheme="purple">
                        {stage.ownerName}
                      </Badge>
                    </Text>
                  </Box>
                </Flex>
                {/* Bottleneck details */}
                {isStageBottleneck(stage) && (
                  <Box mt={3} p={3} bg="red.100" borderRadius="md">
                    <Text fontSize="sm" color="red.700" fontWeight="bold">
                      Bottleneck Reason:
                    </Text>
                    <ul style={{ marginLeft: '1em', color: '#C53030', fontSize: '0.95em' }}>
                      {stage.status === SDLCStatus.DELAYED && (
                        <li>Stage is delayed.</li>
                      )}
                      {!stage.entryCriteriaMet && (
                        <li>Entry criteria not met.</li>
                      )}
                      {!stage.exitCriteriaMet && (
                        <li>Exit criteria not met.</li>
                      )}
                      {stage.delayedTasks > 0 && (
                        <li>{stage.delayedTasks} delayed task(s) in this stage.</li>
                      )}
                    </ul>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default SDLCTrackingDashboard;