import { Context } from '@smart-dao-subgraph/cli'

import { Variables } from '../subgraph.config'

export const goerli: Context<Variables> = {
  name: 'smart-dao',
  network: 'goerli',
  variables: {
    block: 8245222,
    persistent: {
      DAOsProxyAddress: '0x4237E9a558Ff18Bac731ca8491573C97BbF2a60e'
    }
  }
}
