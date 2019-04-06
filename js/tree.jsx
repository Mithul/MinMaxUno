class Animated extends React.PureComponent {
	constructor(props) {
		super(props);
		if (props.animated) {
			// If we are animating, we set the initial positions of the nodes and links to be the position of the root node
			// and animate from there
			let initialX = props.nodes[0].x;
			let initialY = props.nodes[0].y;
			this.state = {
				nodes: props.nodes.map(n => ({ ...n, x: initialX, y: initialY })),
				links: props.links.map(l => ({
					source: { ...l.source, x: initialX, y: initialY },
					target: { ...l.target, x: initialX, y: initialY }
				}))
			};
		} else {
			this.state = {
				nodes: props.nodes,
				links: props.links
			};
		}
	}

	componentDidMount() {
		if (this.props.animated) {
			this.animate(this.props);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.nodes === this.props.nodes && nextProps.links === this.props.links) {
			return;
		}

		if (!nextProps.animated) {
			this.setState({ nodes: nextProps.nodes, links: nextProps.links });
			return;
		}

		this.animate(nextProps);
	}

	animate(props) {
		// Stop previous animation if one is already in progress.  We will start the next animation
		// from the position we are currently in
		clearInterval(this.animation);

		let counter = 0;

		// Do as much one-time calculation outside of the animation step, which needs to be fast
		let animationContext = this.getAnimationContext(this.state, props);

		this.animation = setInterval(() => {
			counter++;

			if (counter === props.steps) {
				clearInterval(this.animation);
				this.animation = null;
				this.setState({ nodes: props.nodes, links: props.links });
				return;
			}

			this.setState(this.calculateNewState(animationContext, counter / props.steps));
		}, props.duration / props.steps);
	}

	getAnimationContext(initialState, newState) {
		// Nodes/links that are in both states need to be moved from the old position to the new one
		// Nodes/links only in the initial state are being removed, and should be moved to the position
		// of the closest ancestor that still exists, or the new root
		// Nodes/links only in the new state are being added, and should be moved from the position of
		// the closest ancestor that previously existed, or the old root

		// The base determines which node/link the data (like classes and labels) comes from for rendering

		// We only run this once at the start of the animation, so optimization is less important
		let addedNodes = newState.nodes
			.filter(n1 => initialState.nodes.every(n2 => !this.areNodesSame(n1, n2)))
			.map(n1 => ({ base: n1, old: this.getClosestAncestor(n1, newState, initialState), new: n1 }));
		let changedNodes = newState.nodes
			.filter(n1 => initialState.nodes.some(n2 => this.areNodesSame(n1, n2)))
			.map(n1 => ({ base: n1, old: initialState.nodes.find(n2 => this.areNodesSame(n1, n2)), new: n1 }));
		let removedNodes = initialState.nodes
			.filter(n1 => newState.nodes.every(n2 => !this.areNodesSame(n1, n2)))
			.map(n1 => ({ base: n1, old: n1, new: this.getClosestAncestor(n1, initialState, newState) }));

		let addedLinks = newState.links
			.filter(l1 => initialState.links.every(l2 => !this.areLinksSame(l1, l2)))
			.map(l1 => ({ base: l1, old: this.getClosestAncestor(l1.target, newState, initialState), new: l1 }));
		let changedLinks = newState.links
			.filter(l1 => initialState.links.some(l2 => this.areLinksSame(l1, l2)))
			.map(l1 => ({ base: l1, old: initialState.links.find(l2 => this.areLinksSame(l1, l2)), new: l1 }));
		let removedLinks = initialState.links
			.filter(l1 => newState.links.every(l2 => !this.areLinksSame(l1, l2)))
			.map(l1 => ({ base: l1, old: l1, new: this.getClosestAncestor(l1.target, initialState, newState) }));

		return {
			nodes: changedNodes.concat(addedNodes).concat(removedNodes),
			links: changedLinks.concat(addedLinks).concat(removedLinks)
		};
	}

	getClosestAncestor(node, stateWithNode, stateWithoutNode) {
		let oldParent = node;

		while (oldParent) {
			let newParent = stateWithoutNode.nodes.find(n => this.areNodesSame(oldParent, n));

			if (newParent) {
				return newParent;
			}

			oldParent = stateWithNode.nodes.find(n => (this.props.getChildren(n) || []).some(c => this.areNodesSame(oldParent, c)));
		}

		return stateWithoutNode.nodes[0];
	}

	areNodesSame(a, b) {
		return a.data[this.props.keyProp] === b.data[this.props.keyProp];
	}

	areLinksSame(a, b) {
		return a.source.data[this.props.keyProp] === b.source.data[this.props.keyProp] && a.target.data[this.props.keyProp] === b.target.data[this.props.keyProp];
	}

	calculateNewState(animationContext, interval) {
		return {
			nodes: animationContext.nodes.map(n => this.calculateNodePosition(n.base, n.old, n.new, interval)),
			links: animationContext.links.map(l => this.calculateLinkPosition(l.base, l.old, l.new, interval))
		};
	}

	calculateNodePosition(node, start, end, interval) {
		return {
			...node,
			x: this.calculateNewValue(start.x, end.x, interval),
			y: this.calculateNewValue(start.y, end.y, interval)
		};
	}

	calculateLinkPosition(link, start, end, interval) {
		return {
			source: {
				...link.source,
				x: this.calculateNewValue(start.source ? start.source.x : start.x, end.source ? end.source.x : end.x, interval),
				y: this.calculateNewValue(start.source ? start.source.y : start.y, end.source ? end.source.y : end.y, interval)
			},
			target: {
				...link.target,
				x: this.calculateNewValue(start.target ? start.target.x : start.x, end.target ? end.target.x : end.x, interval),
				y: this.calculateNewValue(start.target ? start.target.y : start.y, end.target ? end.target.y : end.y, interval)
			}
		};
	}

	calculateNewValue(start, end, interval) {
		return start + (end - start) * this.props.easing(interval);
	}

	render() {
		return (
			<Container {...this.props} {...this.state}/>);
	}
}

class Container extends React.PureComponent {
	render() {
		return (
			<svg {...this.props.svgProps} height={this.props.height} width={this.props.width}>
				{ this.props.children }
				{ this.props.links.map(link =>
					<Link
						key={link.target.data[this.props.keyProp]}
						keyProp={this.props.keyProp}
						source={link.source}
						target={link.target}
						x1={link.source.x}
						x2={link.target.x}
						y1={link.source.y}
						y2={link.target.y}
						pathProps={{ ...this.props.pathProps, ...link.target.data.pathProps }}/>)
				}
				{ this.props.nodes.map(node =>
					<Node
						key={node.data[this.props.keyProp]}
						keyProp={this.props.keyProp}
						labelProp={this.props.labelProp}
						offset={this.props.nodeOffset}
						radius={this.props.nodeRadius}
						x={node.x}
						y={node.y}
						circleProps={{ ...this.props.circleProps, ...node.data.circleProps }}
						gProps={{ ...this.props.gProps, ...node.data.gProps }}
						textProps={{ ...this.props.textProps, ...node.data.textProps }}
						{...node.data}/>)
				}
			</svg>);
	}
}

function diagonal(x1, y1, x2, y2) {
	return `M${y1},${x1}C${(y1 + y2) / 2},${x1} ${(y1 + y2) / 2},${x2} ${y2},${x2}`;
}

class Link extends React.PureComponent {
	render() {
		const wrappedProps = wrapHandlers(
			this.props.pathProps,
			this.props.source.data[this.props.keyProp],
			this.props.target.data[this.props.keyProp]
		);

		let d = diagonal(
			this.props.x1,
			this.props.y1,
			this.props.x2,
			this.props.y2
		);

		return <path {...wrappedProps} d={d}/>;
	}
}

class Node extends React.PureComponent {
	getTransform() {
		return `translate(${this.props.y}, ${this.props.x})`;
	}

	render() {
		const wrappedCircleProps = wrapHandlers(
			this.props.circleProps,
			this.props[this.props.keyProp]
		);

		const wrappedGProps = wrapHandlers(
			this.props.gProps,
			this.props[this.props.keyProp]
		);

		const wrappedTextProps = wrapHandlers(
			this.props.textProps,
			this.props[this.props.keyProp]
		);

		return (
			<g {...wrappedGProps} transform={this.getTransform()}>
				<circle {...wrappedCircleProps} r={this.props.radius}/>
				<text {...wrappedTextProps} dx={this.props.radius + 0.5} dy={this.props.offset}>
					{this.props[this.props.labelProp]}
				</text>
			</g>);
	}
}

function easeQuadOut(t) {
  return t * (2 - t);
}

const defaultProps = {
	animated: false,
	duration: 500,
	easing: easeQuadOut,
	getChildren: n => n.children,
	steps: 20,
	keyProp: 'name',
	labelProp: 'name',
	margins: {
		bottom: 10,
		left: 20,
		right: 150,
		top: 10
	},
	nodeOffset: 3.5,
	nodeRadius: 5,
	circleProps: {},
	gProps: {
		className: 'node'
	},
	pathProps: {
		className: 'link'
	},
	svgProps: {},
	textProps: {}
};

class Tree extends React.PureComponent {
	render() {
		const contentWidth = this.props.width - this.props.margins.left - this.props.margins.right;
		const contentHeight = this.props.height - this.props.margins.top - this.props.margins.bottom;

		// data is cloned because d3 will mutate the object passed in
		let data = hierarchy(clone(this.props.data), this.props.getChildren);

		let root = tree().size([contentHeight, contentWidth])(data);
		let nodes = root.descendants();
		let links = root.links();

		nodes.forEach(node => {
			node.y += this.props.margins.top;
		});

		return (
			<Animated
				animated={this.props.animated}
				duration={this.props.duration}
				easing={this.props.easing}
				getChildren={this.props.getChildren}
				height={this.props.height}
				keyProp={this.props.keyProp}
				labelProp={this.props.labelProp}
				links={links}
				nodes={nodes}
				nodeOffset={this.props.nodeOffset}
				nodeRadius={this.props.nodeRadius}
				steps={this.props.steps}
				width={this.props.width}
				circleProps={this.props.circleProps}
				gProps={this.props.gProps}
				pathProps={this.props.pathProps}
				svgProps={this.props.svgProps}
				textProps={this.props.textProps}>
				{ this.props.children }
			</Animated>);
	}
}

Tree.defaultProps = defaultProps;
