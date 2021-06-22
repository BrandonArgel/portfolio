import './styles/button.css'

const Button = ({
    href,
    text,
    image,
    project
  }) => {
        if(project){
            return (
                <a className="button-project" target="_blank" rel="noreferrer" href={href}>{text}{image && (
                    <img className="button-img" src={image} alt={image} />
                )}</a>
            )
        }
        return (
            <a className="button" target="_blank" rel="noreferrer" href={href}>{text}{image && (
                <img className="button-img" src={image} alt={image} />
            )}</a>
        )
  }
  
  export default Button;