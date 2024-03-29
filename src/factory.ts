import {
  DataSourceContext,
  dataSource,
  Address,
  log
} from '@graphprotocol/graph-ts'

import {
  AssetInitializable,
  DAOInitializable,
  ERC20Initializable,
  LedgerInitializable,
  MemberInitializable,
  VotePoolInitializable
} from './../generated/templates'
import { Created as CreatedEvent } from '../generated/DAOsFactory/DAOs'
import {
  fetchDAOBasicValue,
  getOrCreateAssetPool,
  getOrCreateDAO,
  getOrCreateLedgerPool,
  getOrCreateMemberPool,
  getOrCreateVotePool
} from './utils'

const goerliERC20Address: string[] = [
  '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
]
const goerliERC20Symbol: string[] = ['WETH']
const network = dataSource.network()

export function handleCreated(event: CreatedEvent): void {
  DAOInitializable.create(event.params.dao)
  log.info('DAO Contract initialized: {}', [event.params.dao.toHex()])

  const context = new DataSourceContext()
  context.setString('DAOAddress', event.params.dao.toHex())

  if (network == 'goerli') {
    log.info('Network: {}', [network])
    for (let i = 0; i < goerliERC20Address.length; i++) {
      log.info('ERC-20 initializing. Index {}', [i.toString()])
      const address = goerliERC20Address[i]
      const symbol = goerliERC20Symbol[i]
      log.info('ERC-20 initializing. Symobl {}, Address {}', [symbol, address])
      ERC20Initializable.createWithContext(Address.fromString(address), context)
    }
  }

  const dao = getOrCreateDAO(event.params.dao)
  dao.accounts = []
  dao.blockId = event.block.hash.toHex()
  dao.blockNumber = event.block.number
  dao.blockTimestamp = event.block.timestamp
  const daoBasicInfo = fetchDAOBasicValue(event.params.dao)

  if (daoBasicInfo.ledgerAddress) {
    LedgerInitializable.createWithContext(daoBasicInfo.ledgerAddress, context)
    log.info('Ledger Contract initialized: {}', [
      daoBasicInfo.ledgerAddress.toHex()
    ])

    dao.ledger = daoBasicInfo.ledgerAddress.toHex()
    dao.ledgerPool = getOrCreateLedgerPool(
      daoBasicInfo.ledgerAddress,
      event.params.dao
    ).id
  }

  MemberInitializable.createWithContext(daoBasicInfo.memberAddress, context)
  log.info('Member Contract initialized: {}', [
    daoBasicInfo.memberAddress.toHex()
  ])

  VotePoolInitializable.createWithContext(daoBasicInfo.votePoolAddress, context)
  log.info('VotePool Contract initialized: {}', [
    daoBasicInfo.votePoolAddress.toHex()
  ])

  if (daoBasicInfo.assetAddress) {
    const assetContext = new DataSourceContext()
    assetContext.setString('DAOAddress', event.params.dao.toHex())
    assetContext.setString('type', 'Frist')
    AssetInitializable.createWithContext(
      daoBasicInfo.assetAddress,
      assetContext
    )
    log.info('Asset Contract initialized: {}', [
      daoBasicInfo.assetAddress.toHex()
    ])
    dao.assetPool = [
      getOrCreateAssetPool(daoBasicInfo.assetAddress, event.params.dao, 'Frist')
        .id
    ]

    if (daoBasicInfo.asset2Address) {
      assetContext.setString('type', 'Second')
      AssetInitializable.createWithContext(
        daoBasicInfo.asset2Address,
        assetContext
      )
      log.info('Asset Secondary Contract initialized: {}', [
        daoBasicInfo.asset2Address.toHex()
      ])
      dao.assetPool = [
        getOrCreateAssetPool(
          daoBasicInfo.assetAddress,
          event.params.dao,
          'Frist'
        ).id,
        getOrCreateAssetPool(
          daoBasicInfo.asset2Address,
          event.params.dao,
          'Second'
        ).id
      ]
    }
  }

  dao.name = daoBasicInfo.name
  dao.description = daoBasicInfo.description
  dao.mission = daoBasicInfo.mission
  dao.extend = daoBasicInfo.extend
  dao.image = daoBasicInfo.image
  dao.asset = daoBasicInfo.originAssetAddress.toHex()
  dao.vote = daoBasicInfo.votePoolAddress.toHex()
  dao.member = daoBasicInfo.memberAddress.toHex()
  dao.votePool = getOrCreateVotePool(
    daoBasicInfo.votePoolAddress,
    event.params.dao
  ).id
  dao.memberPool = getOrCreateMemberPool(
    daoBasicInfo.memberAddress,
    event.params.dao
  ).id
  dao.save()
}
