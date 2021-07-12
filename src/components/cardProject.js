import "./styles/cardProject.css";
import Button from "./button";
import githubImg from "../assets/svg/Github-button.svg";
import projectImg from "../assets/svg/Portfolio-button.svg";

const CardProject = ({
  title,
  description,
  image,
  project,
  github,
  right,
  lazy = "",
}) => {
  if (right) {
    return (
      <section className="main__project animation fade_right transform_right appear">
        <div className="main__project--info">
          <h3 className="main__project--title">{title}</h3>
          <p className="main__project--description">{description}</p>
        </div>
        <div className="main__projects--img">
          <img loading={lazy} src={image} alt={title} />
        </div>
        <div className="main__container--buttons">
          <Button
            href={project}
            text="Proyecto"
            image={projectImg}
            project={true}
          />
          <Button
            href={github}
            text="Github"
            image={githubImg}
            project={true}
          />
        </div>
      </section>
    );
  }
  return (
    <section className="main__project animation fade_left transform_left appear">
      <div className="main__project--info">
        <h3 className="main__project--title">{title}</h3>
        <p className="main__project--description">{description}</p>
      </div>
      <div className="main__projects--img">
        <img loading="lazy" src={image} alt={title} />
      </div>
      <div className="main__container--buttons">
        <Button
          href={project}
          text="Proyecto"
          image={projectImg}
          project={true}
        />
        <Button href={github} text="Github" image={githubImg} project={true} />
      </div>
    </section>
  );
};

export default CardProject;
