import ts from "typescript";
import { BasicAnnotationsReader } from "../src/AnnotationsReader/BasicAnnotationsReader";
import { ExtendedAnnotationsReader } from "../src/AnnotationsReader/ExtendedAnnotationsReader";
import { ChainNodeParser } from "../src/ChainNodeParser";
import { CircularReferenceNodeParser } from "../src/CircularReferenceNodeParser";
import { Config, DEFAULT_CONFIG } from "../src/Config";
import { UnknownSymbolLocation } from "../src/Error/UnknownSymbolLocation";
import { ExposeNodeParser } from "../src/ExposeNodeParser";
import { MutableParser } from "../src/MutableParser";
import { NodeParser } from "../src/NodeParser";
import { AnnotatedNodeParser } from "../src/NodeParser/AnnotatedNodeParser";
import { AnyTypeNodeParser } from "../src/NodeParser/AnyTypeNodeParser";
import { ArrayLiteralExpressionNodeParser } from "../src/NodeParser/ArrayLiteralExpressionNodeParser";
import { ArrayNodeParser } from "../src/NodeParser/ArrayNodeParser";
import { AsExpressionNodeParser } from "../src/NodeParser/AsExpressionNodeParser";
import { BooleanLiteralNodeParser } from "../src/NodeParser/BooleanLiteralNodeParser";
import { BooleanTypeNodeParser } from "../src/NodeParser/BooleanTypeNodeParser";
import { CallExpressionParser } from "../src/NodeParser/CallExpressionParser";
import { ConditionalTypeNodeParser } from "../src/NodeParser/ConditionalTypeNodeParser";
import { EnumNodeParser } from "../src/NodeParser/EnumNodeParser";
import { ExpressionWithTypeArgumentsNodeParser } from "../src/NodeParser/ExpressionWithTypeArgumentsNodeParser";
import { FunctionNodeParser } from "../src/NodeParser/FunctionNodeParser";
import { HiddenNodeParser } from "../src/NodeParser/HiddenTypeNodeParser";
import { IndexedAccessTypeNodeParser } from "../src/NodeParser/IndexedAccessTypeNodeParser";
import { InterfaceAndClassNodeParser } from "../src/NodeParser/InterfaceAndClassNodeParser";
import { IntersectionNodeParser } from "../src/NodeParser/IntersectionNodeParser";
import { IntrinsicNodeParser } from "../src/NodeParser/IntrinsicNodeParser";
import { LiteralNodeParser } from "../src/NodeParser/LiteralNodeParser";
import { MappedTypeNodeParser } from "../src/NodeParser/MappedTypeNodeParser";
import { NeverTypeNodeParser } from "../src/NodeParser/NeverTypeNodeParser";
import { NotKnownNodeParser } from "../src/NodeParser/NotKnownNodeParser";
import { NullLiteralNodeParser } from "../src/NodeParser/NullLiteralNodeParser";
import { NumberLiteralNodeParser } from "../src/NodeParser/NumberLiteralNodeParser";
import { NumberTypeNodeParser } from "../src/NodeParser/NumberTypeNodeParser";
import { ObjectLiteralExpressionNodeParser } from "../src/NodeParser/ObjectLiteralExpressionNodeParser";
import { ObjectTypeNodeParser } from "../src/NodeParser/ObjectTypeNodeParser";
import { OptionalTypeNodeParser } from "../src/NodeParser/OptionalTypeNodeParser";
import { ParameterParser } from "../src/NodeParser/ParameterParser";
import { ParenthesizedNodeParser } from "../src/NodeParser/ParenthesizedNodeParser";
import { PrefixUnaryExpressionNodeParser } from "../src/NodeParser/PrefixUnaryExpressionNodeParser";
import { PromiseNodeParser } from "../src/NodeParser/PromiseNodeParser";
import { PropertyAccessExpressionParser } from "../src/NodeParser/PropertyAccessExpressionParser";
import { RestTypeNodeParser } from "../src/NodeParser/RestTypeNodeParser";
import { SkippedNodeParser } from "../src/NodeParser/SkippedNodeParser";
import { SkippedTypeParser } from "../src/NodeParser/SkippedTypeParser";
import { StringLiteralNodeParser } from "../src/NodeParser/StringLiteralNodeParser";
import { StringTemplateLiteralNodeParser } from "../src/NodeParser/StringTemplateLiteralNodeParser";
import { StringTypeNodeParser } from "../src/NodeParser/StringTypeNodeParser";
import { SymbolTypeNodeParser } from "../src/NodeParser/SymbolTypeNodeParser";
import { TupleNodeParser } from "../src/NodeParser/TupleNodeParser";
import { TypeAliasNodeParser } from "../src/NodeParser/TypeAliasNodeParser";
import { TypeLiteralNodeParser } from "../src/NodeParser/TypeLiteralNodeParser";
import { TypeofNodeParser } from "../src/NodeParser/TypeofNodeParser";
import { TypeOperatorNodeParser } from "../src/NodeParser/TypeOperatorNodeParser";
import { TypeReferenceNodeParser } from "../src/NodeParser/TypeReferenceNodeParser";
import { UndefinedTypeNodeParser } from "../src/NodeParser/UndefinedTypeNodeParser";
import { UnionNodeParser } from "../src/NodeParser/UnionNodeParser";
import { UnknownTypeNodeParser } from "../src/NodeParser/UnknownTypeNodeParser";
import { VoidKeywordTypeParser } from "../src/NodeParser/VoidKeywordTypeParser";
import { VoidTypeNodeParser } from "../src/NodeParser/VoidTypeNodeParser";
import { RecursionTypeParser } from "../src/RecursionTypeParser";
import { SubNodeParser } from "../src/SubNodeParser";
import { TopRefNodeParser } from "../src/TopRefNodeParser";

export type ParserAugmentor = (parser: MutableParser) => void;

export function createParser(program: ts.Program, config: Config, augmentor?: ParserAugmentor): NodeParser {
    const typeChecker = program.getTypeChecker();

    const getSymbolAtLocation = typeChecker.getSymbolAtLocation;

    typeChecker.getSymbolAtLocation = (node: ts.Node) => {
        const symbol = getSymbolAtLocation(node);
        if (!symbol) {
            throw new UnknownSymbolLocation(node);
        }
        return symbol;
    };

    const chainNodeParser = new ChainNodeParser(typeChecker, [], config);

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    function withExpose(nodeParser: SubNodeParser): SubNodeParser {
        return new ExposeNodeParser(typeChecker, nodeParser, mergedConfig.expose!, mergedConfig.jsDoc!, mergedConfig);
    }
    function withTopRef(nodeParser: NodeParser): NodeParser {
        return new TopRefNodeParser(chainNodeParser, mergedConfig.type!, mergedConfig.topRef!);
    }
    function withJsDoc(nodeParser: SubNodeParser): SubNodeParser {
        const extraTags = new Set(mergedConfig.extraTags);
        if (mergedConfig.jsDoc === "extended") {
            return new AnnotatedNodeParser(nodeParser, new ExtendedAnnotationsReader(typeChecker, extraTags));
        } else if (mergedConfig.jsDoc === "basic") {
            return new AnnotatedNodeParser(nodeParser, new BasicAnnotationsReader(extraTags));
        } else {
            return nodeParser;
        }
    }
    function withCircular(nodeParser: SubNodeParser): SubNodeParser {
        return new CircularReferenceNodeParser(nodeParser, mergedConfig);
    }

    if (augmentor) {
        augmentor(chainNodeParser);
    }

    chainNodeParser
        // the following parser must stay at top
        .addNodeParser(new SkippedTypeParser(config))
        .addNodeParser(new SkippedNodeParser(config))
        .addNodeParser(new PromiseNodeParser(typeChecker))
        .addNodeParser(new HiddenNodeParser(typeChecker))
        .addNodeParser(new RecursionTypeParser(typeChecker, chainNodeParser, config))
        .addNodeParser(new StringTypeNodeParser())
        .addNodeParser(new SymbolTypeNodeParser())
        .addNodeParser(new NumberTypeNodeParser())
        .addNodeParser(new BooleanTypeNodeParser())
        .addNodeParser(new AnyTypeNodeParser())
        .addNodeParser(new UnknownTypeNodeParser())
        .addNodeParser(new VoidTypeNodeParser())
        .addNodeParser(new UndefinedTypeNodeParser())
        .addNodeParser(new NeverTypeNodeParser())
        .addNodeParser(new ObjectTypeNodeParser())
        .addNodeParser(new AsExpressionNodeParser(chainNodeParser))
        // .addNodeParser(new FunctionParser(chainNodeParser))
        .addNodeParser(withJsDoc(new ParameterParser(chainNodeParser)))
        .addNodeParser(new StringLiteralNodeParser())
        .addNodeParser(new StringTemplateLiteralNodeParser(chainNodeParser))
        .addNodeParser(new IntrinsicNodeParser())
        .addNodeParser(new NumberLiteralNodeParser())
        .addNodeParser(new BooleanLiteralNodeParser())
        .addNodeParser(new NullLiteralNodeParser())

        .addNodeParser(new ObjectLiteralExpressionNodeParser(chainNodeParser))
        .addNodeParser(new ArrayLiteralExpressionNodeParser(chainNodeParser))

        .addNodeParser(new PrefixUnaryExpressionNodeParser(chainNodeParser))

        .addNodeParser(new LiteralNodeParser(chainNodeParser))
        .addNodeParser(new ParenthesizedNodeParser(chainNodeParser))

        .addNodeParser(new TypeReferenceNodeParser(typeChecker, chainNodeParser, mergedConfig))
        .addNodeParser(new ExpressionWithTypeArgumentsNodeParser(typeChecker, chainNodeParser, mergedConfig))

        .addNodeParser(new IndexedAccessTypeNodeParser(chainNodeParser))
        .addNodeParser(new TypeofNodeParser(typeChecker, chainNodeParser, mergedConfig))
        .addNodeParser(new MappedTypeNodeParser(chainNodeParser, mergedConfig.additionalProperties!, mergedConfig))
        .addNodeParser(new ConditionalTypeNodeParser(typeChecker, chainNodeParser))
        .addNodeParser(new TypeOperatorNodeParser(chainNodeParser))

        .addNodeParser(new UnionNodeParser(typeChecker, chainNodeParser, mergedConfig))
        .addNodeParser(new IntersectionNodeParser(typeChecker, chainNodeParser))
        .addNodeParser(new TupleNodeParser(typeChecker, chainNodeParser))
        .addNodeParser(new OptionalTypeNodeParser(chainNodeParser))
        .addNodeParser(new RestTypeNodeParser(chainNodeParser))

        .addNodeParser(new CallExpressionParser(typeChecker, chainNodeParser))
        .addNodeParser(new PropertyAccessExpressionParser(typeChecker, chainNodeParser))

        .addNodeParser(
            withCircular(withExpose(withJsDoc(new TypeAliasNodeParser(typeChecker, chainNodeParser, mergedConfig))))
        )
        .addNodeParser(withExpose(withJsDoc(new EnumNodeParser(typeChecker, mergedConfig))))
        .addNodeParser(
            withCircular(
                withExpose(
                    withJsDoc(
                        new InterfaceAndClassNodeParser(
                            typeChecker,
                            withJsDoc(chainNodeParser),
                            mergedConfig.additionalProperties!,
                            mergedConfig
                        )
                    )
                )
            )
        )
        .addNodeParser(
            withCircular(
                withExpose(
                    withJsDoc(
                        new TypeLiteralNodeParser(
                            withJsDoc(chainNodeParser),
                            mergedConfig.additionalProperties!,
                            mergedConfig
                        )
                    )
                )
            )
        )

        /**
         * keep the following parsers in same order
         */

        .addNodeParser(
            withCircular(
                withExpose(withJsDoc(new FunctionNodeParser(typeChecker, withJsDoc(chainNodeParser), mergedConfig)))
            )
        )

        .addNodeParser(new FunctionNodeParser(typeChecker, withJsDoc(chainNodeParser), mergedConfig))

        .addNodeParser(new VoidKeywordTypeParser())

        .addNodeParser(new ArrayNodeParser(chainNodeParser))
        // the following parser must always be last
        .addNodeParser(new NotKnownNodeParser(config));

    return withTopRef(chainNodeParser);
}
