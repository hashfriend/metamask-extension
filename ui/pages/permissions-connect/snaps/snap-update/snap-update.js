import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { PageContainerFooter } from '../../../../components/ui/page-container';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import SnapInstallWarning from '../../../../components/app/snaps/snap-install-warning';
import Box from '../../../../components/ui/box/box';
import {
  AlignItems,
  BLOCK_SIZES,
  BorderStyle,
  FLEX_DIRECTION,
  JustifyContent,
  TextVariant,
  TEXT_ALIGN,
} from '../../../../helpers/constants/design-system';

import UpdateSnapPermissionList from '../../../../components/app/snaps/update-snap-permission-list';
import { getSnapInstallWarnings } from '../util';
import PulseLoader from '../../../../components/ui/pulse-loader/pulse-loader';
import InstallError from '../../../../components/app/snaps/install-error/install-error';
import SnapAuthorship from '../../../../components/app/snaps/snap-authorship';
import { Text } from '../../../../components/component-library';
import { useOriginMetadata } from '../../../../hooks/useOriginMetadata';
import { getSnapName } from '../../../../helpers/utils/util';

export default function SnapUpdate({
  request,
  requestState,
  approveSnapUpdate,
  rejectSnapUpdate,
  targetSubjectMetadata,
}) {
  const t = useI18nContext();

  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const originMetadata = useOriginMetadata(request.metadata?.dappOrigin) || {};

  const onCancel = useCallback(
    () => rejectSnapUpdate(request.metadata.id),
    [request, rejectSnapUpdate],
  );

  const onSubmit = useCallback(
    () => approveSnapUpdate(request.metadata.id),
    [request, approveSnapUpdate],
  );

  const approvedPermissions = requestState.approvedPermissions ?? {};
  const revokedPermissions = requestState.unusedPermissions ?? {};
  const newPermissions = requestState.newPermissions ?? {};
  const { newVersion } = requestState;

  const isLoading = requestState.loading;
  const hasError = !isLoading && requestState.error;

  const warnings = getSnapInstallWarnings(
    newPermissions,
    targetSubjectMetadata,
    t,
  );

  const shouldShowWarning = warnings.length > 0;

  const snapName = getSnapName(targetSubjectMetadata.origin);

  const handleSubmit = () => {
    if (!hasError && shouldShowWarning) {
      setIsShowingWarning(true);
    } else if (hasError) {
      onCancel();
    } else {
      onSubmit();
    }
  };

  return (
    <Box
      className="page-container snap-update"
      justifyContent={JustifyContent.spaceBetween}
      height={BLOCK_SIZES.FULL}
      borderStyle={BorderStyle.none}
      flexDirection={FLEX_DIRECTION.COLUMN}
    >
      <Box
        className="snap-update__header"
        paddingLeft={4}
        paddingRight={4}
        alignItems={AlignItems.center}
        flexDirection={FLEX_DIRECTION.COLUMN}
      >
        <SnapAuthorship snapId={targetSubjectMetadata.origin} />
        {!isLoading && !hasError && (
          <Text
            paddingBottom={4}
            paddingTop={4}
            variant={TextVariant.headingLg}
          >
            {t('snapUpdate')}
          </Text>
        )}
      </Box>
      <Box className="snap-update__content">
        {isLoading && (
          <Box
            className="snap-update__content__loader-container"
            flexDirection={FLEX_DIRECTION.COLUMN}
            alignItems={AlignItems.center}
            justifyContent={JustifyContent.center}
          >
            <PulseLoader />
          </Box>
        )}
        {hasError && (
          <InstallError error={requestState.error} title={t('requestFailed')} />
        )}
        {!hasError && !isLoading && (
          <>
            <Text
              className="snap-update__content__permission-description"
              paddingBottom={4}
              paddingLeft={4}
              paddingRight={4}
              textAlign={TEXT_ALIGN.CENTER}
            >
              {t('snapUpdateRequest', [
                <b key="1">{originMetadata?.hostname}</b>,
                <b key="2">{snapName}</b>,
                <b key="3">v{newVersion}</b>,
              ])}
            </Text>
            <UpdateSnapPermissionList
              approvedPermissions={approvedPermissions}
              revokedPermissions={revokedPermissions}
              newPermissions={newPermissions}
              targetSubjectMetadata={targetSubjectMetadata}
            />
          </>
        )}
      </Box>
      <Box
        className="snap-update__footer"
        alignItems={AlignItems.center}
        flexDirection={FLEX_DIRECTION.COLUMN}
      >
        <PageContainerFooter
          cancelButtonType="default"
          hideCancel={hasError}
          disabled={isLoading}
          onCancel={onCancel}
          cancelText={t('cancel')}
          onSubmit={handleSubmit}
          submitText={t(hasError ? 'ok' : 'update')}
        />
      </Box>
      {isShowingWarning && (
        <SnapInstallWarning
          onCancel={() => setIsShowingWarning(false)}
          onSubmit={onSubmit}
          snapName={targetSubjectMetadata.name}
          warnings={warnings}
        />
      )}
    </Box>
  );
}

SnapUpdate.propTypes = {
  request: PropTypes.object.isRequired,
  requestState: PropTypes.object.isRequired,
  approveSnapUpdate: PropTypes.func.isRequired,
  rejectSnapUpdate: PropTypes.func.isRequired,
  targetSubjectMetadata: PropTypes.shape({
    iconUrl: PropTypes.string,
    name: PropTypes.string,
    origin: PropTypes.string.isRequired,
    sourceCode: PropTypes.string,
    version: PropTypes.string,
  }).isRequired,
};
