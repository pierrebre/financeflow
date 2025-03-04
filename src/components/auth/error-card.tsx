import { CardWrapper } from './card-wrapper';

export const ErrorCard = () => {
	return <CardWrapper headerLabel="Something went wrong" backButtonLabel="Go back" backButtonHref="/auth/login" />;
};
