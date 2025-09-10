type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function DatePicker(props: Props) {
  return <input type="date" {...props} className={`input ${props.className || ''}`} />
}
