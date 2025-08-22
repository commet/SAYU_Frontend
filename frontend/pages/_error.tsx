import NextErrorComponent from 'next/error'

const CustomErrorComponent = (props: any) => {
  return <NextErrorComponent statusCode={props.statusCode} />
}

CustomErrorComponent.getInitialProps = async (contextData: any) => {
  return NextErrorComponent.getInitialProps(contextData)
}

export default CustomErrorComponent