import React, { useState } from "react";

import Section from "../components/Section";
import Title from "../components/Title";

import "./styles/Experience.css";

export default function Experience() {
	// Tab panel in react
	const [activeTab, setActiveTab] = useState(0);

	return (
		<Section id="experience">
			<div className="tabs__container animation fade_right transform_right appear">
				<Title>Where I have worked</Title>
				<div className="tabs">
					<div className="tabs__list">
						<button
							className={`tabs__item ${activeTab === 0 ? "active" : ""}`}
							onClick={() => setActiveTab(0)}
						>
							<span>Axo Systems</span>
						</button>
					</div>
					<div className="tabs__panel">
						<div className={`tabs__panel-item ${activeTab === 0 ? "active" : ""}`}>
							<h3>
								<span>Front-End</span> in <strong>Axo Systems</strong>
							</h3>
							<p>July 2021 - Present</p>
							<ul>
								<li>
									Developed and maintained code for in-house and client websites using HTML, CSS, Sass,
									JavaScript, React, Firebase, Wordpress, and more.
								</li>
								<li>
									Manually tested sites in various browsers and mobile devices to ensure cross-browser
									compatibility and responsiveness.
								</li>
								<li>Clients included CNI Consultores, Solar Center, and more.</li>
							</ul>
						</div>
						{/* <div className={`tabs__panel-item ${activeTab === 1 ? "active" : ""}`}>
					<h3>
					Front-End <span>Axo Systems</span>
					</h3>
					<p>July - Present</p>
					<ul>
					<li>
					Developed and maintained code for in-house and client websites primarily using HTML, CSS, Sass,
					JavaScript, and jQuery
					</li>
					<li>
					Manually tested sites in various browsers and mobile devices to ensure cross-browser
					compatibility and responsiveness
					</li>
					<li>Clients included JetBlue, Lovesac, U.S. Cellular, U.S. Department of Defense, and more</li>
					</ul>
				</div> */}
					</div>
				</div>
			</div>
		</Section>
	);
}
