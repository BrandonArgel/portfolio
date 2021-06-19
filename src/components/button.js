import './styles/button.css'

const Button = ({
    href,
    text,
    image
  }) => {
        return (
            <a className="button" target="_blank" rel="noreferrer" href={href}>{text}{image && (
                <img src={image} alt={image} />
            )}</a>
        )
  }
  
  export default Button;