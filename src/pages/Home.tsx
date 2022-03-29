import * as React from "react";
import { About, Contact, Hero, Jobs, Particles, Projects } from "components";

const Home = () => {
	React.useEffect(() => {
		if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }
	});

	return (
		<>
			<Hero />
			<About />
			<Jobs />
			<Projects />
			<Contact />
			<Particles />
		</>
	);
};

export default Home;
