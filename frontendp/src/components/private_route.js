import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Layout from "./layout";
import {
  Box,
  Skeleton,
  SkeletonText,
  VStack,
  Heading,
  Center,
} from "@chakra-ui/react";

/**
 * Premium Page Skeleton Loader
 */
const PageSkeleton = () => (
  <Layout>
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Skeleton height="40px" width="300px" mb={4} borderRadius="lg" />
          <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
        </Box>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          <Skeleton height="200px" borderRadius="2xl" />
          <Skeleton height="200px" borderRadius="2xl" />
        </Box>
        <Box>
          <Skeleton height="300px" borderRadius="2xl" />
        </Box>
      </VStack>
    </Box>
  </Layout>
);

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, authChecked } = useAuth();
  const location = useLocation();

  // 🛡️ WAIT UNTIL INITIAL AUTH CHECK IS DONE
  if (!authChecked || (loading && !user)) {
    return <PageSkeleton />;
  }

  // 🛡️ REDIRECT UNAUTHENTICATED
  if (!user) {
    // Redirect to login with previous path as state for better redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🛡️ ROLE-BASED ACCESS CONTROL
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <Center h="70vh" px={4}>
          <VStack spacing={6} textAlign="center">
            <Box
              bg="red.50"
              p={6}
              borderRadius="full"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box color="red.500" fontSize="4xl">🔒</Box>
            </Box>
            <Box>
              <Heading size="xl" color="gray.800" mb={2}>
                Access Denied
              </Heading>
              <Box color="gray.600" fontSize="lg" maxW="lg">
                Your current role (<strong>{user.role}</strong>) does not have permission to access
                <strong> {location.pathname}</strong>.
                Please contact an administrator if you believe this is an error.
              </Box>
            </Box>
          </VStack>
        </Center>
      </Layout>
    );
  }

  // ✅ AUTHENTICATED AND AUTHORIZED
  return children;
};

export default PrivateRoute;

