import { Address, Bytes, log, BigInt } from '@graphprotocol/graph-ts'

import { ADDRESS_ZERO, ZERO_BI } from './utils'
import { Account, Member } from '../generated/schema'
import { DAO as DAOContract } from '../generated/templates/DAOInitializable/DAO'
import { Member as MemberContract } from '../generated/templates/MemberInitializable/Member'
import { VotePool as VotePoolContract } from '../generated/templates/VotePoolInitializable/VotePool'

export class DAOPrimaryInfo {
  name: string
  description: string
  mission: string
  image: string
  extend: Bytes | null
  memberAddress: Address
  votePoolAddress: Address
  operatorAddress: Address
  ledgerAddress: Address
}

export class MemberInfo {
  baseName: string
  name: string
  description: string
  image: string
  votes: BigInt
}

export class ProposalInfo {
  isAnonymous: boolean
  origin: string | null
  originAddress: Address
  name: string | null
  description: string | null
  lifespan: BigInt | null
  expiry: BigInt | null
  target: Address[]
  data: Bytes[]
  passRate: BigInt | null
  loopCount: BigInt | null
  loopTime: BigInt | null
  voteTotal: BigInt | null
  agreeTotal: BigInt | null
  executeTime: BigInt | null
  isAgree: boolean
  isClose: boolean
  isExecuted: boolean
}

export class CreateLedgerParam {
  from: Address | null
  balance: BigInt | null
  name: string | null
  description: string | null
  to: Address | null
  member: BigInt | null
}

export function fetchDAOBasicValue(address: Address): DAOPrimaryInfo {
  const contract = DAOContract.bind(address)
  const nameResult = contract.try_name()
  const descriptionResult = contract.try_description()
  const missionResult = contract.try_mission()
  const imageResult = contract.try_image()
  const extendResult = contract.try_extend()
  const memberAddress = contract.try_member()
  const votePoolAddress = contract.try_root()
  const operatorAddress = contract.try_operator()
  const ledgerAddress = contract.try_ledger()
  return {
    name: nameResult.reverted ? 'unknown' : nameResult.value,
    description: descriptionResult.reverted
      ? 'unknown'
      : descriptionResult.value,
    mission: missionResult.reverted ? 'unknown' : missionResult.value,
    image: imageResult.reverted ? 'unknown' : imageResult.value,
    extend: extendResult.reverted ? null : extendResult.value,
    memberAddress: memberAddress.reverted ? ADDRESS_ZERO : memberAddress.value,
    votePoolAddress: votePoolAddress.reverted
      ? ADDRESS_ZERO
      : votePoolAddress.value,
    operatorAddress: operatorAddress.reverted
      ? ADDRESS_ZERO
      : operatorAddress.value,
    ledgerAddress: ledgerAddress.reverted ? ADDRESS_ZERO : ledgerAddress.value
  } as DAOPrimaryInfo
}

export function fetchMemberValue(
  address: Address,
  tokenId: BigInt
): MemberInfo {
  const contract = MemberContract.bind(address)
  log.debug('Fetching Member ID {}', [tokenId.toString()])
  log.debug('Fetching Member Info. Contract Address {} ID {}', [
    address.toHex(),
    tokenId.toString()
  ])
  const baseName = contract.name()
  const total = contract.total()
  log.debug('Total Member {}', [total.toString()])
  const info = contract.getMemberInfo(tokenId)
  return {
    baseName,
    name: info.name,
    description: info.description,
    image: info.image,
    votes: info.votes
  } as MemberInfo
}

export function fetchVoteProposalValue(
  id: BigInt,
  address: Address,
  DAOAddress: Address
): ProposalInfo {
  log.debug('Fetching Vote Proposal DAO Address {}', [DAOAddress.toHex()])
  const contract = VotePoolContract.bind(address)
  log.debug('Fetching Vote Proposal ID {}', [id.toHex()])
  log.debug('Fetching Vote Proposal Info. Contract Address {} ID {}', [
    address.toHex(),
    id.toHex()
  ])
  const proposal = contract.getProposal(id)
  const isAnonymous = proposal.originId == ZERO_BI
  log.debug('Fetching Vote Proposal Is Anonymous {}', [isAnonymous.toString()])
  log.debug('Fetching Vote Proposal Origin ID {}', [proposal.originId.toHex()])
  return {
    isAnonymous,
    origin: isAnonymous
      ? proposal.origin.toHex()
      : DAOAddress.toHex().concat('-').concat(proposal.originId.toHex()),
    originAddress: proposal.origin,
    name: proposal.name,
    description: proposal.description,
    lifespan: proposal.lifespan,
    expiry: proposal.expiry,
    target: proposal.target,
    data: proposal.data,
    passRate: proposal.passRate,
    loopCount: proposal.loopCount,
    loopTime: proposal.loopTime,
    voteTotal: proposal.voteTotal,
    agreeTotal: proposal.agreeTotal,
    executeTime: proposal.executeTime,
    isAgree: proposal.isAgree,
    isClose: proposal.isClose,
    isExecuted: proposal.isExecuted
  } as ProposalInfo
}