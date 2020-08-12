import { useCSS, UseCSSStyleInput, Unstable_FluentContextProvider } from '@fluentui/react-bindings';
import { mount } from 'enzyme';
// @ts-ignore No typings :(
import * as prettier from 'prettier';
import * as React from 'react';
import { RendererRenderGlobal } from '@fluentui/react-northstar-styles-renderer';

expect.addSnapshotSerializer({
  test(value) {
    return value?._isMockFunction;
  },
  print(value: jest.Mock) {
    const css = value.mock.calls.map(call => call[0]).join(' ');

    return prettier.format(css, { parser: 'css' }).trim();
  },
});

const TestComponent: React.FC<{ styles: UseCSSStyleInput[] }> = props => {
  const className = useCSS(...props.styles);

  return <div className={className} />;
};

function getMountOptions(renderGlobal: RendererRenderGlobal, rtl: boolean = false) {
  return {
    wrappingComponentProps: {
      value: {
        renderer: { renderGlobal },
        rtl,
      },
    },
    wrappingComponent: Unstable_FluentContextProvider,
  };
}

describe('useCSS', () => {
  it('returns a className that contains', () => {
    const styles = [{ color: 'red' }];
    const wrapper = mount(<TestComponent styles={styles} />);

    expect(wrapper.find('div').prop('className')).toBeDefined();
  });

  it('handles nested selectors', () => {
    const styles = [
      {
        left: '20px',

        '& p': {
          color: 'green',
          '> span': { color: 'yellow' },
        },

        '&.ui-image': { color: 'blue' },
        '& .ui-loader': { color: 'blue' },
      },
    ];
    const renderGlobal = jest.fn();

    mount(<TestComponent styles={styles} />, getMountOptions(renderGlobal));

    expect(renderGlobal).toMatchInlineSnapshot(`
      .fcss.f1j1cyx0 {
        left: 20px;
      }
      .fcss.f1j1cyx0 p {
        color: green;
      }
      .fcss.f1j1cyx0 p > span {
        color: yellow;
      }
      .fcss.f1j1cyx0.ui-image {
        color: blue;
      }
      .fcss.f1j1cyx0 .ui-loader {
        color: blue;
      }
    `);
  });

  it('handles pseudo selectors', () => {
    const styles = [
      {
        ':before': { color: 'red' },
        ':focus': { color: 'green' },
        ':focus-visible': { color: 'red' },
      },
    ];
    const renderGlobal = jest.fn();

    mount(<TestComponent styles={styles} />, getMountOptions(renderGlobal));

    expect(renderGlobal).toMatchInlineSnapshot(`
      .fcss.f1yae8dp:before {
        color: red;
      }
      .fcss.f1yae8dp:focus {
        color: green;
      }
      [data-whatinput="keyboard"] .fcss.f1yae8dp:focus,
      [data-whatinput="initial"] .fcss.f1yae8dp:focus {
        color: red;
      }
    `);
  });

  it('handles RTL without collisions', () => {
    const styles = [{ left: '20px', paddingLeft: '20px' }];
    const renderGlobal = jest.fn();

    mount(<TestComponent styles={styles} />, getMountOptions(renderGlobal, false));
    mount(<TestComponent styles={styles} />, getMountOptions(renderGlobal, true));

    expect(renderGlobal).toMatchInlineSnapshot(`
      .fcss.fl5cdwz {
        left: 20px;
        padding-left: 20px;
      }
      .fcss.rfl5cdwz {
        right: 20px;
        padding-right: 20px;
      }
    `);
  });

  it('handles merge via passed "className"', () => {
    const renderGlobal = jest.fn();

    const firstWrapper = mount(<TestComponent styles={[{ left: '20px' }]} />);
    const firstClassName = firstWrapper.find('div').prop('className') as string;

    mount(<TestComponent styles={[firstClassName, { color: 'red', left: '30px' }]} />, getMountOptions(renderGlobal));

    expect(renderGlobal).toMatchInlineSnapshot(`
      .fcss.fgam49s {
        left: 20px;
        color: red;
        left: 30px;
      }
    `);
  });
});