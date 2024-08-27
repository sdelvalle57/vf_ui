import React, { ReactNode } from "react";
import { Box, Button, Stack } from "@chakra-ui/react";
import Header from "./Header";

interface PageProps {
  children: ReactNode;
}


export default function Layout(props: PageProps) {
  return (
    <div>
      <Header />
      <Stack spacing="8">
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "0", sm: "10" }}
          bg={{ base: "#f1f3f4", sm: "bg-surface" }}
          boxShadow={{ base: "none", sm: "md" }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <Stack spacing="12">
            <Stack spacing="6">
              {props.children}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </div>
  );
}
