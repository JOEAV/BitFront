import { Title,Text, Container } from "@mantine/core";
import { HeaderResponsive } from "../../Components/HeaderResponsive";
export default function HomePage() {
  return (
    <>
    <HeaderResponsive
      links={[
        { label: "home", link: "#home" },
        { label: "favorites", link: "#favs" },
      ]}
    />
    <main>
      <Container>
      <Title order={2}>Welcome to Bitfront</Title>
      <Title order={4}
       sx={(theme) => ({
        color: theme.colors.orange[4],
       })}>Your Bitcoin rate tracker</Title>
      </Container>

      
    </main>
    </>
  );
}
