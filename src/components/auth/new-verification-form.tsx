'use client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { BeatLoader } from 'react-spinners';
import { CardWrapper } from './card-wrapper';
import { newVerification } from '@/src/actions/auth/newVerification';
import { FormError } from '../form-error';
import { FormSucess } from '../form-sucess';

export const NewVerificationForm = () => {
	const [error, setError] = useState<string | undefined>();
	const [success, setSuccess] = useState<string | undefined>();

	const searchParams = useSearchParams();
	const token = searchParams?.get('token');

	const onSubmit = useCallback(() => {
		if (error || success) return;

		if (!token) {
			setError('Token is missing');
			return;
		}

		newVerification(token)
			.then((data) => {
				setSuccess(data?.success);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, [token, error, success]);

	useEffect(() => {
		onSubmit();
	}, [onSubmit]);

	return (
		<CardWrapper headerLabel="Confirm your email" backButtonLabel="Backto login" backButtonHref="/auth/login">
			<div className="flex items-center justify-center w-full">
				{!error && !success && <BeatLoader />}
				{!success && <FormError message={error} />}
				<FormSucess message={success} />
			</div>
		</CardWrapper>
	);
};
