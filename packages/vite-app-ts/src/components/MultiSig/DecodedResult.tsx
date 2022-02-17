import { FC, useContext } from 'react';
import { primaryColor } from '~~/styles/styles';
import { Descriptions } from 'antd';
import { Address, Balance } from '~~/eth-components/ant';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { InnerAppContext } from '~~/models/CustomContexts';
import { DecodedCalldata } from './models/decoded-calldata.model';

interface IDecodeResultProps {
  decodedCalldata: DecodedCalldata;
}

export const DecodedResult: FC<IDecodeResultProps> = (props) => {
  const scaffoldAppProviders = useScaffoldAppProviders();
  const { ethPrice } = useContext(InnerAppContext);
  const result = props.decodedCalldata;

  return (
    <div>
      <Descriptions bordered size="small">
        {result.signature && (
          <Descriptions.Item span={3} label="Func Sig">
            <span style={{ color: primaryColor }}>{result.signature}</span>
          </Descriptions.Item>
        )}

        {result.functionFragment &&
          result.functionFragment.inputs.map((element: { type: string; name: string }, index: number) => {
            let content;

            if (element.type === 'address') {
              content = (
                <Address
                  fontSize={16}
                  address={result.args[index]}
                  ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                />
              );
            }
            if (element.type === 'uint256') {
              const bnValue = result.args[index];
              content =
                element.name === 'value' ? (
                  <Balance fontSize={16} balance={bnValue} dollarMultiplier={ethPrice} padding={0} />
                ) : (
                  bnValue.toString()
                );
            }

            return (
              <Descriptions.Item key={element.name} span={3} label={element.name}>
                {content}
              </Descriptions.Item>
            );
          })}
      </Descriptions>
    </div>
  );
};
